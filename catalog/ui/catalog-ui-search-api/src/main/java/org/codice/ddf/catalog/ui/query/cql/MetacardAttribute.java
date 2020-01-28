package org.codice.ddf.catalog.ui.query.cql;

public interface MetacardAttribute {

  boolean getMultivalued();

  boolean getIndexed();

  String getFormat();
}
