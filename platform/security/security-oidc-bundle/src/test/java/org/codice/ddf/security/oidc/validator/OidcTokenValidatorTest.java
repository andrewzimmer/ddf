/**
 * Copyright (c) Codice Foundation
 *
 * <p>This is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or any later version.
 *
 * <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public
 * License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.security.oidc.validator;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.pac4j.core.context.HttpConstants.APPLICATION_JSON;
import static org.pac4j.oidc.profile.OidcProfileDefinition.AUTH_TIME;
import static org.pac4j.oidc.profile.OidcProfileDefinition.AZP;
import static org.pac4j.oidc.profile.OidcProfileDefinition.EMAIL_VERIFIED;
import static org.pac4j.oidc.profile.OidcProfileDefinition.PREFERRED_USERNAME;

import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.impl.PublicClaims;
import com.google.common.collect.ImmutableList;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.util.Base64URL;
import com.nimbusds.jose.util.Resource;
import com.nimbusds.jose.util.ResourceRetriever;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.PlainJWT;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.oauth2.sdk.id.Issuer;
import com.nimbusds.oauth2.sdk.token.AccessToken;
import com.nimbusds.oauth2.sdk.token.BearerAccessToken;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import java.net.URI;
import java.nio.charset.Charset;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;
import org.junit.Before;
import org.junit.Test;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.context.session.SessionStore;
import org.pac4j.oidc.config.OidcConfiguration;

public class OidcTokenValidatorTest {

  private ResourceRetriever resourceRetriever;
  private OidcConfiguration configuration;
  private OIDCProviderMetadata oidcProviderMetadata;

  private Algorithm validAlgorithm;
  private Algorithm invalidAlgorithm;

  @Before
  public void setup() throws Exception {
    // Generate the RSA key pair
    KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
    gen.initialize(2048);
    KeyPair keyPair = gen.generateKeyPair();
    RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
    RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();

    JWK sigJwk =
        new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyUse(KeyUse.SIGNATURE)
            .keyID(UUID.randomUUID().toString())
            .build();

    String jwk = "{\"keys\": [" + sigJwk.toPublicJWK().toJSONString() + "] }";

    oidcProviderMetadata = mock(OIDCProviderMetadata.class);
    when(oidcProviderMetadata.getIDTokenJWSAlgs()).thenReturn(ImmutableList.of(JWSAlgorithm.RS256));
    when(oidcProviderMetadata.getIssuer())
        .thenReturn(new Issuer("http://localhost:8080/auth/realms/master"));
    when(oidcProviderMetadata.getJWKSetURI())
        .thenReturn(
            new URI("http://localhost:8080/auth/realms/master/protocol/openid-connect/certs"));

    resourceRetriever = mock(ResourceRetriever.class);
    Resource resource = new Resource(jwk, APPLICATION_JSON);
    when(resourceRetriever.retrieveResource(any())).thenReturn(resource);

    configuration = mock(OidcConfiguration.class);
    when(configuration.getClientId()).thenReturn("ddf-client");
    when(configuration.getSecret()).thenReturn("secret");
    when(configuration.isUseNonce()).thenReturn(true);
    when(configuration.getResponseType()).thenReturn("id_token token");
    when(configuration.findProviderMetadata()).thenReturn(oidcProviderMetadata);
    when(configuration.findResourceRetriever()).thenReturn(resourceRetriever);

    validAlgorithm = Algorithm.RSA256(publicKey, privateKey);
    invalidAlgorithm = Algorithm.HMAC256("WRONG");
  }

  @Test
  public void testValidateIdTokens() throws Exception {
    WebContext context = getWebContext();
    String stringJwt = getIdTokenBuilder().withClaim("nonce", "myNonce").sign(validAlgorithm);

    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateIdTokens(jwt, context, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateIdTokensInvalidSignature() throws Exception {
    WebContext context = getWebContext();
    String stringJwt = getIdTokenBuilder().withClaim("nonce", "myNonce").sign(invalidAlgorithm);

    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateIdTokens(jwt, context, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateIdTokensExpiredToken() throws Exception {
    WebContext context = getWebContext();
    String stringJwt =
        getIdTokenBuilder()
            .withClaim("nonce", "myNonce")
            .withExpiresAt(new Date(Instant.now().minus(Duration.ofDays(3)).toEpochMilli()))
            .sign(invalidAlgorithm);

    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateIdTokens(jwt, context, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateIdTokensUnsignedJwt() throws Exception {
    String[] roles = {"create-realm", "offline_access", "admin", "uma_authorization"};

    JWTClaimsSet claimsSet =
        new JWTClaimsSet.Builder()
            .jwtID(UUID.randomUUID().toString())
            .expirationTime(new Date(Instant.now().plus(Duration.ofDays(3)).toEpochMilli()))
            .notBeforeTime(new Date(0))
            .issueTime(new Date())
            .issuer("http://localhost:8080/auth/realms/master")
            .audience("ddf-client")
            .subject("subject")
            .claim(PublicClaims.TYPE, "ID")
            .claim(AUTH_TIME, new Date())
            .claim("roles", roles)
            .claim(EMAIL_VERIFIED, false)
            .claim(PREFERRED_USERNAME, "admin")
            .build();

    JWT jwt = new PlainJWT(claimsSet);
    OidcTokenValidator.validateIdTokens(jwt, null, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateIdTokensInvalidNonce() throws Exception {
    WebContext context = getWebContext();
    String stringJwt = getIdTokenBuilder().withClaim("nonce", "WRONG").sign(validAlgorithm);
    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateIdTokens(jwt, context, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateIdTokensNoNonce() throws Exception {
    WebContext context = getWebContext();
    String stringJwt = getIdTokenBuilder().sign(validAlgorithm);
    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateIdTokens(jwt, context, configuration);
  }

  @Test
  public void testValidateUserInfoIdToken() throws Exception {
    String stringJwt = getIdTokenBuilder().sign(validAlgorithm);
    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateUserInfoIdToken(jwt, resourceRetriever, oidcProviderMetadata);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateUserInfoIdTokenInvalidSignature() throws Exception {
    String stringJwt = getIdTokenBuilder().sign(invalidAlgorithm);
    JWT jwt = SignedJWT.parse(stringJwt);
    OidcTokenValidator.validateUserInfoIdToken(jwt, resourceRetriever, oidcProviderMetadata);
  }

  @Test
  public void testValidateAccessToken() throws Exception {
    String accessTokenString = getAccessTokenBuilder().sign(validAlgorithm);
    AccessToken accessToken = new BearerAccessToken(accessTokenString);

    MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
    messageDigest.update(accessTokenString.getBytes(Charset.forName("US-ASCII")));
    byte[] hash = messageDigest.digest();
    byte[] firstHalf = Arrays.copyOf(hash, hash.length / 2);

    String idToken =
        getIdTokenBuilder()
            .withClaim("nonce", "myNonce")
            .withClaim("at_hash", Base64URL.encode(firstHalf).toString())
            .sign(validAlgorithm);

    JWT jwt = SignedJWT.parse(idToken);
    OidcTokenValidator.validateAccessToken(
        accessToken, jwt, resourceRetriever, oidcProviderMetadata, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateAccessTokenInvalidSignature() throws Exception {
    String accessTokenString = getAccessTokenBuilder().sign(invalidAlgorithm);
    AccessToken accessToken = new BearerAccessToken(accessTokenString);

    MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
    messageDigest.update(accessTokenString.getBytes(Charset.forName("US-ASCII")));
    byte[] hash = messageDigest.digest();
    byte[] firstHalf = Arrays.copyOf(hash, hash.length / 2);

    String idToken =
        getIdTokenBuilder()
            .withClaim("nonce", "myNonce")
            .withClaim("at_hash", Base64URL.encode(firstHalf).toString())
            .sign(validAlgorithm);

    JWT jwt = SignedJWT.parse(idToken);
    OidcTokenValidator.validateAccessToken(
        accessToken, jwt, resourceRetriever, oidcProviderMetadata, configuration);
  }

  @Test(expected = OidcValidationException.class)
  public void testValidateAccessTokenInvalidAtHash() throws Exception {
    String accessTokenString = getAccessTokenBuilder().sign(validAlgorithm);
    AccessToken accessToken = new BearerAccessToken(accessTokenString);

    String idToken =
        getIdTokenBuilder()
            .withClaim("nonce", "myNonce")
            .withClaim("at_hash", "WRONG")
            .sign(validAlgorithm);

    JWT jwt = SignedJWT.parse(idToken);
    OidcTokenValidator.validateAccessToken(
        accessToken, jwt, resourceRetriever, oidcProviderMetadata, configuration);
  }

  private JWTCreator.Builder getIdTokenBuilder() {
    String[] roles = {"create-realm", "offline_access", "admin", "uma_authorization"};

    return com.auth0
        .jwt
        .JWT
        .create()
        .withJWTId(UUID.randomUUID().toString())
        .withExpiresAt(new Date(Instant.now().plus(Duration.ofDays(3)).toEpochMilli()))
        .withNotBefore(new Date(0))
        .withIssuedAt(new Date())
        .withIssuer("http://localhost:8080/auth/realms/master")
        .withAudience("ddf-client")
        .withSubject("subject")
        .withClaim(PublicClaims.TYPE, "ID")
        .withClaim(AUTH_TIME, new Date())
        .withArrayClaim("roles", roles)
        .withClaim(EMAIL_VERIFIED, false)
        .withClaim(PREFERRED_USERNAME, "admin");
  }

  private JWTCreator.Builder getAccessTokenBuilder() {
    String[] audience = {"master-realm", "account"};
    String[] roles = {"create-realm", "offline_access", "admin", "uma_authorization"};

    return com.auth0
        .jwt
        .JWT
        .create()
        .withJWTId(UUID.randomUUID().toString())
        .withExpiresAt(new Date(Instant.now().plus(Duration.ofDays(3)).toEpochMilli()))
        .withNotBefore(new Date(0))
        .withIssuedAt(new Date())
        .withIssuer("http://localhost:8080/auth/realms/master")
        .withArrayClaim("aud", audience)
        .withSubject("subject")
        .withClaim("typ", "Bearer")
        .withClaim(AZP, "ddf-client")
        .withClaim("auth_time", new Date())
        .withArrayClaim("roles", roles)
        .withClaim(EMAIL_VERIFIED, false)
        .withClaim(PREFERRED_USERNAME, "admin");
  }

  private WebContext getWebContext() {
    WebContext context = mock(WebContext.class);
    SessionStore sessionStore = mock(SessionStore.class);
    when(sessionStore.get(context, OidcConfiguration.NONCE_SESSION_ATTRIBUTE))
        .thenReturn("myNonce");
    when(context.getSessionStore()).thenReturn(sessionStore);
    return context;
  }
}
