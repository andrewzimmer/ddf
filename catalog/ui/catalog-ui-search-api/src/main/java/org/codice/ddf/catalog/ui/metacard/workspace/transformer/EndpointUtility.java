package org.codice.ddf.catalog.ui.metacard.workspace.transformer;

import ddf.catalog.data.Result;
import ddf.catalog.federation.FederationException;
import ddf.catalog.source.SourceUnavailableException;
import ddf.catalog.source.UnsupportedQueryException;
import java.util.Map;

public interface EndpointUtility {
  CqlQueryResponse executeCqlQuery(CqlRequest cqlRequest)
      throws UnsupportedQueryException, SourceUnavailableException, FederationException;

  Map<String, Result> getMetacardsByTag(String tagStr);
}
