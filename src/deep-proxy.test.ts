import { expect, fn } from 'jsr:@std/expect';
import createDeepProxy, {
	getDeepProxyTarget,
	ProxyEventCallbackFn,
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
	expect(getDeepProxyTarget(instance)).toBe(state);
});
