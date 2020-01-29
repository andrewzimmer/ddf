package org.codice.ddf.catalog.ui.metacard.workspace.transformer;

public interface Status {
  long getHits();

  long getElapsed();

  String getId();

  long getCount();

  boolean getSuccessful();
}
