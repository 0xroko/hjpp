export const idFromHref = (href?: string) => {
  const regex = /r\/(\S+)/;

  // this is temp fix since meilisearch can alter html atrributes (href) and that causes bad parsing
  // of html tags
  if (!href) {
    return "greška";
  }
  const match = href.match(regex);
  if (match) {
    const id = match[1];
    // strip html tags until meilisearch support
    return id.replace(/(<([^>]+)>)/gi, "");
  }

  return "greška";
};
