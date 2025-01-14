import attachDeepProxy, { type ProxyEventCallbackFn } from './deep-proxy.ts';

interface ObserverInstanceI {
	observed: object;
	callbacks: ProxyEventCallbackFn[];
}
const map = new WeakMap<WeakKey, ObserverInstanceI>();

export function createDeepObserver<T extends object>(
	target: T,
	callback: ProxyEventCallbackFn,
): T {
	let instance = map.get(target);

	if (!instance) {
		const observed = attachDeepProxy(
			target,
			(p) => instance?.callbacks.forEach((c) => c(p)),
		);
		instance = { observed, callbacks: [] };
		map.set(target, instance);
		map.set(instance.observed, instance);
	}

	instance.callbacks.push(callback);
	return instance.observed as T;
}

export function removeDeepObserver<T extends object>(
	target: T,
	callback: ProxyEventCallbackFn,
): void {
	const instance = map.get(target);
	if (!instance) return;

	const index = instance.callbacks.indexOf(callback);
	if (index < 0) return;

	instance.callbacks.splice(index, 1);
}

export default createDeepObserver;
