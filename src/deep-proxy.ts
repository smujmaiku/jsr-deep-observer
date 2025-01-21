export type PropT = string | symbol;

export type ProxyEventCallbackFn = (prop: PropT[]) => void;

function preventInvalidTypes(value: unknown): void {
	if (value instanceof Map) throw new Error();
	if (value instanceof Set) throw new Error();
	if (value && {}.toString.call(value) === '[object Function]') {
		throw new Error();
	}
}

function preventInvalidProps(prop: unknown): void {
	if (prop === createDeepProxy.targetSymbol) throw new Error();
}

export function createDeepProxy<T extends object>(
	target: T,
	callback: ProxyEventCallbackFn,
): T {
	preventInvalidTypes(target);

	const { proxy: instance } = Proxy.revocable(target, {
		get(state, prop) {
			if (prop === createDeepProxy.targetSymbol) {
				return target;
			}

			const value = Reflect.get(state, prop);
			if (value instanceof Object) {
				return createDeepProxy(value, (p) => {
					callback([prop, ...p]);
				});
			}
			return value;
		},
		set(state, prop, value) {
			preventInvalidTypes(value);
			preventInvalidProps(prop);

			const result = Reflect.set(state, prop, value);
			callback([prop]);
			return result;
		},
		deleteProperty(state, prop) {
			preventInvalidProps(prop);

			const result = Reflect.deleteProperty(state, prop);
			callback([prop]);
			return result;
		},
		has(state, prop) {
			if (prop === createDeepProxy.targetSymbol) {
				return true;
			}
			return Reflect.has(state, prop);
		},
		defineProperty() {
			throw new Error();
		},
		setPrototypeOf() {
			throw new Error();
		},
	});

	return instance;
}

createDeepProxy.targetSymbol = Symbol('target');

export function checkDeepProxy<T extends object>(instance: T): instance is T {
	return Reflect.has(instance, createDeepProxy.targetSymbol);
}

export function getDeepProxyTarget<T extends object>(instance: T): T {
	const target = Reflect.get(instance, createDeepProxy.targetSymbol);
	if (!target) throw new Error();

	return target as T;
}

export default createDeepProxy;
