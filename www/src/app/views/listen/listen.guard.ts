import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { EncryptionService } from "@services/encryption.service";
import config from "src/app/config";

@Injectable()
export class CanActivateListen {    
  constructor(private router:Router, private enc: EncryptionService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {            
    // let valid = Boolean(route.queryParams?.['tId']);
    
    // if (valid)
    // {
    //   const conf = config.listen as any;
    //   const hashParts = this.enc.decrypt('hash', route.queryParams['tId']).split(":");
    //   valid = hashParts.every((hashPart, index) => this.enc.decrypt(`chunk${index+1}`, conf[`chunk${index+1}`]) === hashPart);          
    // }

    // if (!valid) {
    //   this.router.navigate(['/']);
    // }

    // return valid;
    return true;
  }
}