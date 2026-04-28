import { invariant } from "outvariant";

//#region src/utils/globalsRegistry.ts
var GlobalsRegistry = class {
	#globals = /* @__PURE__ */ new Map();
	replaceGlobal(key, nextValue) {
		invariant(!this.#globals.has(key), `Failed to replace a global value at "${key}": already replaced.`);
		const match = getDeepPropertyDescriptor(globalThis, key);
		if (typeof match === "undefined") {
			console.warn(`Failed to replace a global value at "${key}": not a global value.`);
			return () => {};
		}
		Object.defineProperty(globalThis, key, {
			value: nextValue,
			enumerable: true,
			configurable: true
		});
		const restoreGlobal = () => {
			if (!this.#globals.has(key)) return;
			if (match.owner === globalThis) Object.defineProperty(match.owner, key, match.descriptor);
			else
 /**
			* @todo Delete the proxy property set by the registry.
			* If the owner isn't `globalThis`, the property is likely nested in the prototype.
			* The registry does not meddle with those, they are left intact.
			*/
			Reflect.deleteProperty(globalThis, key);
			this.#globals.delete(key);
		};
		this.#globals.set(key, restoreGlobal);
		return restoreGlobal;
	}
	restoreAllGlobals() {
		const errors = [];
		for (const [, restoreGlobal] of this.#globals) try {
			restoreGlobal();
		} catch (error) {
			if (error instanceof Error) errors.push(error);
			else throw error;
		}
		if (errors.length > 0) throw new AggregateError(errors, "FOO!");
	}
};
const globalsRegistry = new GlobalsRegistry();
/**
* Returns a property descriptor for the given property on the owner.
* Walks down the prototype chain if the property does not exist on the owner.
* Handy for getting a global property descriptor where `globalThis` is
* replaced with a controlled class (e.g. ServiceWorkerGlobalScope).
*/
function getDeepPropertyDescriptor(owner, key) {
	let currentOwner = owner;
	let descriptor;
	while (currentOwner) {
		descriptor = Object.getOwnPropertyDescriptor(currentOwner, key);
		if (descriptor) return {
			owner: currentOwner,
			descriptor
		};
		currentOwner = Object.getPrototypeOf(currentOwner);
	}
}

//#endregion
//#region src/utils/hasConfigurableGlobal.ts
/**
* Returns a boolean indicating whether the given global property
* is defined and is configurable.
*/
function hasConfigurableGlobal(propertyName) {
	const match = getDeepPropertyDescriptor(globalThis, propertyName);
	if (typeof match === "undefined") return false;
	const { descriptor } = match;
	if (typeof descriptor.get === "function" && typeof descriptor.get() === "undefined") return false;
	if (typeof descriptor.get === "undefined" && descriptor.value == null) return false;
	if (typeof descriptor.set === "undefined" && !descriptor.configurable) {
		console.error(`[MSW] Failed to apply interceptor: the global \`${propertyName}\` property is non-configurable. This is likely an issue with your environment. If you are using a framework, please open an issue about this in their repository.`);
		return false;
	}
	return true;
}

//#endregion
export { globalsRegistry as n, hasConfigurableGlobal as t };
//# sourceMappingURL=hasConfigurableGlobal-jN_-v3gp.mjs.map