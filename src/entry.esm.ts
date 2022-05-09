import _Vue, { PluginFunction } from 'vue';

// Import vue components
// @ts-ignore
import * as components from './components/index.js';

// install function executed by Vue.use()
const install: PluginFunction<any> = function installDigiwfFormRenderer(Vue: typeof _Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    // @ts-ignore
    Vue.component(componentName, component);
  });
};

// Create module definition for Vue.use()
export default install;

// To allow individual component use, export components
// each can be registered via Vue.component()
// @ts-ignore
export * from './components/index.js';
