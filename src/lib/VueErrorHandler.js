import UAParser from 'ua-parser-js'
import axios from 'axios'
import qs from 'qs'

class ErrorHandler {
  constructor() {
    this.queue = [];
    this.options = {
      action: '',
      encrypt: false,
      uploadWhenIdle: false
    };
  }

  install(Vue, options) {
    this.options = Object.assign(this.options, options);

    var oldOnError = Vue.config.errorHandler;
    Vue.config.errorHandler = (error, vm, info) => {
      var metadata = {};
      if (this.isPlainObject(vm)) {
        metadata.componentName = this.formatComponentName(vm);
        metadata.propsData = vm.$options.propsData;
      }
      if (!this.isUndefined(info)) {
        metadata.lifecycleHook = info;
      }
      //处理错误
      window.console && console.error(error);

      var parser = new UAParser();
      const data = {
        name: error.name || info && info.name || 'caught error',
        message: error.message || info && info.message,
        stacktrace: error.stack,
        metadata,
        userAgent: parser.getResult(),
        timestamp: Math.round(Date.now() / 1000)
      };
      
      if (this.options.uploadWhenIdle && window.requestIdleCallback) {
        this.queue.push(data);
        window.requestIdleCallback((deadline) => {
          if (!deadline.didTimeout) {
            this.apiRequest();
          }
        })
      } else {
        this.apiRequest(data);
      }

      if (typeof oldOnError === 'function') {
        oldOnError.call(Vue, error, vm, info);
      }
    };
  }

  apiRequest(data = null) {
    const _data = data || this.queue.shift();
    axios({
      url: this.options.action,
      data: qs.stringify(_data),
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
    }).then(res => {
      if (res.statusCode == 200) {
        console.log('error upload success.')
      } else {
        console.warn('error upload fail.', res)
      }
    }).catch(err => {
      console.warn('error upload fail.', err)
    })
  }

  formatComponentName(vm) {
    if (vm.$root === vm) {
      return 'root instance';
    }
    var name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
    return ((name ? "component <" + name + ">" : 'anonymous component') +
      (vm._isVue && vm.$options.__file ? " at " + vm.$options.__file : ''));
  }

  isPlainObject(wat) {
    return Object.prototype.toString.call(wat) === '[object Object]';
  }

  isUndefined(wat) {
    return wat === void 0;
  }
}



export default new ErrorHandler();
