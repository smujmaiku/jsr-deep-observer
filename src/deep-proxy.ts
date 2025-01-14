export type PropT = string | symbol;

export type ProxyEventCallbackFn = (prop: PropT[]) => void;

export function attachDeepProxy<T extends Object>(
	target: T,
	callback: ProxyEventCallbackFn,
) {
	return new Proxy(target, {
		get: (target, prop) => {
			const value = Reflect.get(target, prop);
			if (value instanceof Object) {
				return attachDeepProxy(value, (p) => {
					callback([prop, ...p]);
				});
			}
			return value;
		},
		set: (target, prop, value) => {
			const result = Reflect.set(target, prop, value);
			callback([prop]);
			return result;
		},
		deleteProperty: (target, prop) => {
			const result = Reflect.deleteProperty(target, prop);
			callback([prop]);
			return result;
		},
	});
}

export default attachDeepProxy;
