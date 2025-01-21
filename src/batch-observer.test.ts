import { FakeTime } from 'jsr:@std/testing/time';
import { expect, fn } from 'jsr:@std/expect';
import createDeepObserverBatched, {
	BatchedEventCallbackFn,
	removeDeepObserverBatched,
} from './batch-observer.ts';

Deno.test('callback is called when instance changes', () => {
	using time = new FakeTime();

	const state: any = { a: { b: 1 } };
	const cb = fn() as BatchedEventCallbackFn;

	const instance = createDeepObserverBatched(state, cb, 10);

	instance.a.c = 3;
	delete instance.a.b;
	expect(state).toEqual({ a: { c: 3 } });
	expect(cb).not.toBeCalled();

	time.tick(10);
	expect(cb).toBeCalledWith([['a', 'c'], ['a', 'b']]);
});

Deno.test('instances should be combined when possible', () => {
	using time = new FakeTime();

	const state: any = { a: { b: 1 } };
	const cb = fn() as BatchedEventCallbackFn;
	const cb2 = fn() as BatchedEventCallbackFn;

	const instance = createDeepObserverBatched(state, cb, 10);
	const instance2 = createDeepObserverBatched(state, cb2, 20);

	instance.a.c = 3;
	expect(cb).not.toBeCalled();

	time.tick(10);
	expect(cb).toBeCalledWith([['a', 'c']]);
	expect(cb2).not.toBeCalled();

	time.tick(10);
	expect(cb2).toBeCalledWith([['a', 'c']]);

	expect(instance).toBe(instance2);
	expect(createDeepObserverBatched(instance, () => {}, 10)).toBe(instance);
});

Deno.test('callback can be removed from an instance', () => {
	using time = new FakeTime();

	const state: any = { a: { b: 1 } };
	const cb = fn() as BatchedEventCallbackFn;
	const cb2 = fn() as BatchedEventCallbackFn;

	const instance = createDeepObserverBatched(state, cb, 10);
	createDeepObserverBatched(state, cb2, 20);

	removeDeepObserverBatched(state, cb);

	instance.a.c = 3;

	time.tick(20);
	expect(cb).not.toBeCalled();
	expect(cb2).toBeCalledWith([['a', 'c']]);
});
