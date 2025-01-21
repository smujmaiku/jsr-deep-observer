export type PropT = string | symbol;

export type ProxyEventCallbackFn = (prop: PropT[]) => void;

function preventInvalidTypes(target: unknown): void {
	if (target instanceof Map) throw new Error();
	if (target instanceof Set) throw new Error();
	if (target && {}.toString.call(target) === '[object Function]') {
		throw new Error();
	}
	return;
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

			const result = Reflect.set(state, prop, value);
			callback([prop]);
			return result;
		},
		deleteProperty(state, prop) {
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

export function getDeepProxyTarget<T extends object>(instance: T): T {
	const target = Reflect.get(instance, createDeepProxy.targetSymbol);
	if (!target) throw new Error();

	return target as T;
}

export default createDeepProxy;
