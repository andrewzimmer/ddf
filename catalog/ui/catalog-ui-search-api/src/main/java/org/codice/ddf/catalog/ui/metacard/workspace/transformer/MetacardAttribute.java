package org.codice.ddf.catalog.ui.metacard.workspace.transformer;

public interface MetacardAttribute {

  boolean getMultivalued();

  boolean getIndexed();

  String getFormat();
}
