import pkg from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  // options_page: 'src/pages/options/index.html',
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  permissions: ["tabs", "alarms"],
  host_permissions: ["https://theoldreader.com/*"],
  action: {
    // default_popup: 'src/pages/popup/index.html',
    default_icon: "icon-32.png",
  },
  // chrome_url_overrides: {
  //   newtab: 'src/pages/newtab/index.html',
  // },
  icons: {
    "128": "icon-128.png",
  },
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: ["icon-128.png", "icon-32.png"],
      matches: [],
    },
  ],
};

export default manifest;
