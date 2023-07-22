<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { buffers, clear, operate, pushChar, swapBuffers } from "../../stores";

  let low: string;
  let hi: string;
  let clearAll: boolean;
  let disableOperators: boolean;
  let explicitAllowPrefixedUnary: boolean;

  const isOperator = (op: string) => op.match(/[\/\*\-\+]$/) !== null;
  const isUnaryOperator = (op: string) => op.match(/[\-\+]$/) !== null;

  buffers.subscribe((value) => {
    [low, hi] = value;
    clearAll = low.length === 0;
    disableOperators = (() => {
      if (isOperator(low)) {
        explicitAllowPrefixedUnary = false;
        return true;
      }
      if (low.length + hi.length === 0) {
        explicitAllowPrefixedUnary = true;
        return true;
      }
      return false;
    })();
  });

  const pushOp = (op: string) => {
    if ((explicitAllowPrefixedUnary && isUnaryOperator(op)) || !clearAll)
      return pushChar(op);
    pushChar(`Ans${op}`);
  };

  const onKey = (event: KeyboardEvent) => {
    event.preventDefault();

    // Numbers
    if (event.key.match(/^[\d\.]$/) !== null) return pushChar(event.key);

    // Operators
    if (
      (explicitAllowPrefixedUnary || !disableOperators) &&
      isOperator(event.key)
    )
      return pushOp(event.key);

    // Clear
    const clearKeys = ["c", "C", "Escape", "Esc"];
    if (clearKeys.includes(event.key)) return clear(clearAll);

    // Submit
    if (event.key === "Enter") return operate();

    console.warn(`No key handler for "${event.key}"`);
  };
  onMount(() => document.addEventListener("keyup", onKey));
  onDestroy(() => document.removeEventListener("keyup", onKey));
</script>

<div class="calculator">
  <div class="screen">
    <p class="smol">{hi}</p>
    <p class="beeg" class:placeholder={!Boolean(low)}>{low || "0"}</p>
  </div>
  <div class="btn-container">
    <button
      disabled={hi.length === 0 && low.length === 0}
      on:click={() => clear(clearAll)}
      class="btn-grid"
    >
      {clearAll ? "AC" : "C"}
    </button>
    <button
      disabled={disableOperators}
      on:click={() => pushOp("/")}
      class="btn-grid">/</button
    >
    <button
      disabled={disableOperators}
      on:click={() => pushOp("*")}
      class="btn-grid">*</button
    >
    <button
      disabled={!explicitAllowPrefixedUnary && disableOperators}
      on:click={() => pushOp("-")}
      class="btn-grid">-</button
    >

    <button on:click={() => pushChar("7")} class="btn-grid">7</button>
    <button on:click={() => pushChar("8")} class="btn-grid">8</button>
    <button on:click={() => pushChar("9")} class="btn-grid">9</button>
    <button
      disabled={!explicitAllowPrefixedUnary && disableOperators}
      on:click={() => pushOp("+")}
      class="btn-grid dbl-height">+</button
    >

    <button on:click={() => pushChar("4")} class="btn-grid">4</button>
    <button on:click={() => pushChar("5")} class="btn-grid">5</button>
    <button on:click={() => pushChar("6")} class="btn-grid">6</button>
    <!-- The bottom half of + is here -->

    <button on:click={() => pushChar("1")} class="btn-grid">1</button>
    <button on:click={() => pushChar("2")} class="btn-grid">2</button>
    <button on:click={() => pushChar("3")} class="btn-grid">3</button>
    <button
      disabled={disableOperators}
      on:click={operate}
      class="btn-grid dbl-height">=</button
    >

    <button on:click={() => pushChar("0")} class="btn-grid dbl-width">0</button>
    <button on:click={() => pushChar(".")} class="btn-grid">.</button>
    <!-- The bottom half of = is here -->
  </div>
</div>
