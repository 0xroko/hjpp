export const idFromHref = (href: string) => {
  const regex = /r\/(\S+)/;

  const match = href.match(regex);
  if (match) {
    const id = match[1];
    // strip html tags until meilisearch support
    return id.replace(/(<([^>]+)>)/gi, "");
  }

  return "err";
};
