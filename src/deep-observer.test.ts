import { expect, fn } from 'jsr:@std/expect';
import createDeepObserver, {removeDeepObserver, ProxyEventCallbackFn } from './deep-observer.ts';

Deno.test('callback is called when instance changes', () => {
	const state: any = { a: { b: 1 } };
	const cb = fn() as ProxyEventCallbackFn;

	const instance = createDeepObserver(state, cb);

	instance.a.c = 3;
	expect(cb).toBeCalledWith(['a', 'c']);
	expect(state).toEqual({ a: { b: 1, c: 3 } });

	delete instance.a.b;
	expect(cb).toBeCalledWith(['a', 'b']);
	expect(state).toEqual({ a: { c: 3 } });
});

Deno.test('instances should be combined when possible', () => {
	const state: any = { a: { b: 1 } };
	const cb = fn() as ProxyEventCallbackFn;
	const cb2 = fn() as ProxyEventCallbackFn;

	const instance = createDeepObserver(state, cb);
	const instance2 = createDeepObserver(state, cb2);

	instance.a.c = 3;
	expect(cb).toBeCalledWith(['a', 'c']);
	expect(cb2).toBeCalledWith(['a', 'c']);

	expect(instance).toBe(instance2);
	expect(createDeepObserver(instance, () => {})).toBe(instance);
});

Deno.test('callback can be removed from an instance',()=>{
	const state: any = { a: { b: 1 } };
	const cb = fn() as ProxyEventCallbackFn;
	const cb2 = fn() as ProxyEventCallbackFn;

	const instance = createDeepObserver(state, cb);
	createDeepObserver(state, cb2);

	removeDeepObserver(state, cb);

	instance.a.c = 3;
	expect(cb).not.toBeCalled();
	expect(cb2).toBeCalledWith(['a', 'c']);
})