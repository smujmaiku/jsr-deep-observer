import attachDeepProxy, { ProxyEventCallbackFn } from './deep-proxy';

interface ObserverInstanceI {
	observed: Object;
	callbacks: ProxyEventCallbackFn[];
}
const map = new WeakMap<WeakKey, ObserverInstanceI>();

export function createDeepObserver<T extends Object>(
	target: T,
	callback: ProxyEventCallbackFn,
) {
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
	return instance.observed;
}

export function removeDeepObserver<T extends Object>(
	target: T,
	callback: ProxyEventCallbackFn,
) {
	const instance = map.get(target);
	if (!instance) return;

	const index = instance.callbacks.indexOf(callback);
	if (index < 0) return;

	instance.callbacks.splice(index, 1);
}

export default createDeepObserver;
