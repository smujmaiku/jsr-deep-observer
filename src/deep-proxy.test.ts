import { expect, fn } from 'jsr:@std/expect';
import createDeepProxy, {
	checkDeepProxy,
	getDeepProxyTarget,
	type ProxyEventCallbackFn,
} from './deep-proxy.ts';

Deno.test('callback is called when instance changes', () => {
	const state: any = { a: { b: 1 } };
	const cb = fn() as ProxyEventCallbackFn;

	const instance = createDeepProxy(state, cb);

	instance.a.c = 3;
	expect(cb).toBeCalledWith(['a', 'c']);
	expect(state).toEqual({ a: { b: 1, c: 3 } });

	delete instance.a.b;
	expect(cb).toBeCalledWith(['a', 'b']);
	expect(state).toEqual({ a: { c: 3 } });

	expect('a' in instance).toBeTruthy();
	expect('b' in instance).toBeFalsy();
});

Deno.test('target is recoverable', () => {
	const state: any = { a: 1 };
	const cb = fn() as ProxyEventCallbackFn;

	const instance = createDeepProxy(state, cb);

	expect(instance).not.toBe(state);
	expect(checkDeepProxy(instance)).toBeTruthy();
	expect(getDeepProxyTarget(instance)).toBe(state);

	expect(checkDeepProxy(state)).toBeFalsy();
	expect(() => getDeepProxyTarget(state)).toThrow();
});

Deno.test('invalid value types are thrown', () => {
	const cb = fn() as ProxyEventCallbackFn;

	const instance = createDeepProxy({} as any, cb);

	expect(() => instance.a = new Map()).toThrow();
	expect(() => instance.b = new Set()).toThrow();
	expect(() => instance.c = function () {}).toThrow();
	expect(() => instance.d = () => {}).toThrow();

	expect(() => createDeepProxy(new Map(), cb)).toThrow();
	expect(() => createDeepProxy(new Set(), cb)).toThrow();
	expect(() => createDeepProxy(function () {}, cb)).toThrow();
	expect(() => createDeepProxy(() => {}, cb)).toThrow();
});

Deno.test('reserved symbols are thrown', () => {
	const cb = fn() as ProxyEventCallbackFn;

	const instance = createDeepProxy({} as any, cb);

	expect(() => instance[createDeepProxy.targetSymbol] = 1).toThrow();
	expect(() => delete instance[createDeepProxy.targetSymbol]).toThrow();
});
