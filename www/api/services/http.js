import fetch, { FormData } from 'node-fetch';

class HttpService {
  setConfig(config = {}, method = "GET") {
    let formData = false;

    if (typeof (config.formData) !== "undefined") {
      formData = Boolean(config.formData);
    }

    const multiContentType = formData ? "multipart/form-data" : "application/json";
    const cfg = {
      ...config,
      method,
      headers: {
        "Content-Type": method === "POST" ? multiContentType : "application/json",
        ...config?.headers
      }
    };


    return cfg;
  }
  setBody(data, options) {
    try {
      if (typeof (options.headers) === "object" && options.headers?.["Content-Type"]) {
        switch (options.headers["Content-Type"]) {
          case "multipart/form-data":
            return this.setFormData(data);
          case "application/x-www-form-urlencoded; charset=UTF-8":
            return this.setUrlEncodedData(data);
          case "application/json":
            return this.setJSONData(data);
        }
      } else {
        return this.setJSONData(data);
      }
    } catch (err) {
      console.log(err);
    }
  }
  request(endpoint, cfg) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint);
      if (typeof (cfg.params) !== "undefined") {
        Object.keys(cfg.params).forEach(key => {
          if (typeof (cfg.params[key]) !== "undefined" && cfg.params[key] !== null) {
            url.searchParams.append(key, cfg.params[key]);
          }
        });
      }

      fetch(url, cfg)
        .then(response => {
          response.json().then(data => {
            if (response.status !== 200) {
              reject(response);
            } else {
              resolve(data);
            }
          });
        }).catch(err => {
          reject(err);
        });
    });
  }
  get(endpoint = "", config = {}) {
    const cfg = this.setConfig(config, "GET");
    return this.request(endpoint, cfg);
  }
  post(endpoint = "", data = null, config = {}) {
    const baseCfg = this.setConfig(config, "POST");
    const body = this.setBody(data, baseCfg);
    const cfg = Object.assign(baseCfg, { body: body });

    return this.request(endpoint, cfg);
  }
  put(endpoint = "", data = null, config = {}) {
    const baseCfg = this.setConfig(config, "PUT");
    const body = this.setBody(data, baseCfg);
    const cfg = Object.assign(baseCfg, { body: body });

    return this.request(endpoint, cfg);
  }
  delete(endpoint = "", config = {}) {
    const cfg = this.setConfig(config, "DELETE");
    return this.request(endpoint, cfg);
  }
  setFormData(data) {
    const form = new FormData();

    Object.keys(data).map(key => {
      this.setFormDataValue(form, key, data[key]);
    });

    return form;
  }
  setUrlEncodedData(data) {
    const form = this.setFormData(data);
    let qs = [];

    for (let key of form.keys()) {
      qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(form.get(key))}`);
    }

    return qs.join("&").replace(/%20/g, "+");
  }
  setJSONData(data) {
    return JSON.stringify(data);
  }
  setFormDataValue(form, key, value) {
    if (typeof (value) === "object") {
      if (value instanceof "array") {
        value.map((value, aIndex) => {
          this.setFormDataValue(form, `${key}[${aIndex}]`, value[aIndex]);
        });
      } else {
        Object.keys(value).map(oKey => {
          this.setFormDataValue(form, `${key}[${oKey}]`, value[oKey]);
        });
      }
    } else {
      form.append(key, value);
    }
  }

}

export const httpSvc = new HttpService();