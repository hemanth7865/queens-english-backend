import { defineConfig } from "umi";

export default defineConfig({

  define: {
    AZURE_CODE: "3oRefSONemrd2HatnbHfHLfPMat2fgi2kakJHrCDHhXbmhfDSQ6r8Q==",
    AZURE_URL: "https://ed-uat-functions.azurewebsites.net/",
    ZOOM_GENERIC_LINK: "https://admin.thequeensenglish.co/be/",
    GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
    BLOB_URL: "BLOB_URL",
    BLOB_SAS: "BLOB_SAS",
  },

  plugins: [
    "react-dev-inspector/plugins/umi/react-inspector",
  ],

});
