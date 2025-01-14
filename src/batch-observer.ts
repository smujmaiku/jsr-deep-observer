import type { PropT, ProxyEventCallbackFn } from './deep-proxy.ts';
import createDeepObserver, { removeDeepObserver } from './deep-observer.ts';

export type BatchedEventCallbackFn = (prop: PropT[][]) => void;
const batchedMap = new WeakMap<
	WeakKey,
	WeakMap<BatchedEventCallbackFn, ProxyEventCallbackFn>
>();

export function createDeepObserverBatched<T extends object>(
	target: T,
	callback: BatchedEventCallbackFn,
	delay: number,
): T {
	let timer: number | undefined;
	let batch: Parameters<BatchedEventCallbackFn>[0] = [];

	const batchedCb: ProxyEventCallbackFn = (props) => {
		batch.push(props);
		if (!timer) {
			timer = setTimeout(() => {
				timer = undefined;
				callback(batch);
				batch = [];
			}, delay);
		}
	};

	const observed = createDeepObserver(target, batchedCb);

	let callbacks = batchedMap.get(target);

	if (!callbacks) {
		callbacks = new WeakMap<BatchedEventCallbackFn, ProxyEventCallbackFn>();
		batchedMap.set(target, callbacks);
		batchedMap.set(observed, callbacks);
	}

	callbacks.set(callback, batchedCb);
	return observed;
}

export function removeDeepObserverBatched<T extends object>(
	target: T,
	callback: BatchedEventCallbackFn,
): void {
	const callbacks = batchedMap.get(target);
	if (!callbacks) return;

	const batchedCb = callbacks.get(callback);
	if (!batchedCb) return;
	removeDeepObserver(target, batchedCb);
}
