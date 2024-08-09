<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { menuVisible } from "../stores/stores";
  // import MenuIcon from "../assets/menu.svg";
  import addIcon from "../assets/ainewchat.svg";
  import settingIcon from "../assets/aisettings.svg";
  const dispatch = createEventDispatcher();
  function newChat() {
    dispatch("new-chat");
  }

  function goSettings(){
    return;
    //todo: open setiings
  }
  export let conversation_title: string;
</script>

<div
  class="bg-primary text-black/90 px-4 flex justify-between shrink grow-0 max-h-16 topbar"
>
  <!-- <button
    on:click={() => {
      menuVisible.set(true);
    }}
    class="text-lg font-medium"
  >
    <img class="icon-white w-8" alt="Menu" src={MenuIcon} />
  </button> -->
  <div class="text-[0.8em] font-medium pt-[0.5em] text-center overflow-hidden h-8">
    {conversation_title === "" ? "AI Answser" : conversation_title}
  </div>
  <div class="flex gap-2 items-center">
  <button on:click={newChat} class="btn-custom">
    <img class="icon-small" alt="+" src={addIcon} />
    <span class="btn-text">New chat</span>
  </button>
  <button on:click={newChat} class="btn-custom">
    <img class="icon-small" alt="Settings" src={settingIcon} />
    <span class="btn-text">Settings</span>
  </button>
  </div>
</div>
