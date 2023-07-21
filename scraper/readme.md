# HJP Scraper

## Installation

```
  git clone https://github.com/0xRoko/hjpp && cd scraper
```

Install dependencies

```bash
  pnpm install # or
  npm install # or
  yarn install
```

## Output

All data is stored in `.data` directory.

Directories:

- `definition-pages` - contains fetched definition pages, each page is stored in separate file, filenames: `sha256(url)`
- `sitemap` - contains raw sitemap files

Files:

- `sitemap.json` - contains all sitemap records (sitemap record + sha256 hash for each url)
- `status.json` - contains status of fetched pages (record + recordStatus)
- `definitions.json` - contains parsed definitions

### `definitions.json`

This is the final output of the parser (after running `hjpp parse`), it contains all definitions.

[Typescript types](./../packages/types/index.ts)

Definition example:

```json
{
  "id": "sezanj",
  "rijec": "sȅžanj",
  "detalji": "<b>sȅžanj</b> <i>m</i> 〈G -žnja, N <i>mn</i> -žnji, G sȇžānjā〉",
  "vrsta": "imenica",
  "izvedeniOblici": null,
  "definicija": "<i>pov.</i> mjera za dužinu koja odgovara razmaku raširenih ruku",
  "sintagma": null,
  "frazeologija": null,
  "etimologija": "vidi <a href=\"/r/segnuti\"><b>ségnuti</b> </a>",
  "onomastika": null,
  "hjp": {
    "keyWord": "sežanj",
    "url": "....",
    "id": "d19mWhQ="
  }
}
```

#### IDs

Each definition has unique ID, it's derived from `rijec` field using slugify function, in case there are multiple definitions for the same word, ID will be defined as:

```ts
const hashedWord = createHash("SHA3-512").update(def.rijec);
const suffix = data.digest("base64url").slice(0, 2);
const urlEncodedSuffix = encodeURIComponent(wrd);
const newId = `${id}-${urlEncoded}`;
```

#### hrefs

Since fields like `definicija`, `etimologija` and `sintagma` contain HTML (purified by parser), they also can contain links to other definitions. Parser will update `href` tags to point to correct definition. Default format is `r/<id>`.

## Usage

Parsing steps:

### 1. Fetch and parse sitemaps

This will fetch all sitemaps and parse them into single `sitemap.json` file. Also it will build `status.json` for tracking fetched pages.
Reruning this command **WILL** reset `status.json` file (fetch progress will be lost).

```bash
  pnpm hjpp sitemap
```

### 2. Fetch defintion pages

This will fetch all definition pages and store them in `.data/definitions` directory.

Status of fetched pages is stored in `status.json` file, because you will most likely get IP banned if you are not using proxies (but you will be notified if that happens)

```bash
  pnpm hjpp fetch
```

### 3. Parse defintion pages

This will parse all definition pages and store all definitions in `.data/definitions.json` file.

```bash
  pnpm hjpp parse
```

**Note**: progress won't be saved, so make sure all definitions are fetched.

### Re-fetching definition pages

```bash
  pnpm hjpp fetch --force
```

Or you can run

```bash
  pnpm hjpp sitemap
```

which will refetch all sitemaps and reset `status.json` file.

And then run as usual

```bash
  pnpm hjpp fetch
```
