import generateToken from "./helpers/generateToken";
import axios from "./helpers/axios";

class ZoomAPI {
  private APIKey: string;
  private APISecret: string;
  private JWTToken: string;
  constructor(APIKey: string, APISecret: string) {
    this.APIKey = APIKey;
    this.APISecret = APISecret;
  }

  public generateToken = () => {
    this.JWTToken = generateToken(this.APIKey, this.APISecret);
    return this;
  };

  public init = () => {
    this.generateToken();
    console.log(this.JWTToken, "changed");
    return this;
  };
}

exports.ZoomAPI = ZoomAPI;
