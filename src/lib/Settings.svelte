<script lang="ts">
    import { selectedModel, selectedVoice, selectedMode, showTokens, selectedSize, selectedQuality } from '../stores/stores';
    import { createEventDispatcher } from 'svelte';
    import CloseIcon from "../assets/close.svg";
    import { writable, get, derived } from "svelte/store";
  import { onMount } from 'svelte';

  import {
    apiKey,
    settingsVisible,
    combinedTokens,
    defaultAssistantRole,
    type DefaultAssistantRole,
  } from "../stores/stores";

  const dispatch = createEventDispatcher();

  let apiCheckMessage = writable('');
  let showMessage = writable(''); 

  let models = writable([]); 
  let filteredModels = writable([]); 
  $: $selectedMode, updateFilteredModels();
    $: $models, updateFilteredModels();

  let localApiTextField: string = get(apiKey) || ''; 
  $: localApiTextField = $apiKey || '';

  let apiTextField = '';
  apiKey.subscribe(value => {
    apiTextField = value || '';
    localApiTextField = apiTextField;
  });

  let assistantRoleField = $defaultAssistantRole.role;
  let assistantRoleTypeField = $defaultAssistantRole.type;

  apiKey.subscribe((value) => {
  localStorage.setItem("api_key", JSON.stringify(value));
});

let showTokensToggle = false;
    showTokens.subscribe(value => {
        showTokensToggle = value;
    });
    
onMount(async() => {
   await initializeSettings();

  });
  function handleShowTokensToggleChange() {
        showTokens.set(showTokensToggle);
    }
 function updateFilteredModels() {
        let mode = get(selectedMode);
        let availableModels = get(models);
        let newFilteredModels = [];

        if (mode === "GPT") {
            newFilteredModels = availableModels.filter(model => model.id.includes('gpt') && !model.id.includes('vision'));
        } else if (mode === "GPT + Vision") {
            newFilteredModels = availableModels.filter(model => model.id.includes('vision'));
        } else if (mode === "Dall-E") {
            newFilteredModels = availableModels.filter(model => model.id.includes('dall-e'));
        } else if (mode === "TTS") {
            newFilteredModels = availableModels.filter(model => model.id.includes('tts'));
        }

        filteredModels.set(newFilteredModels);

        // Automatically select the first model in the filtered list if the current selection is not in the new list
        if (newFilteredModels.length > 0 && (!get(selectedModel) || !newFilteredModels.some(model => model.id === get(selectedModel)))) {
            selectedModel.set(newFilteredModels[0].id);
        }
    }
async function initializeSettings() {
    const savedMode = localStorage.getItem("selectedMode");
    selectedMode.set(savedMode || "GPT"); 

    if (apiTextField) {
        await fetchModels(apiTextField);
    } else {
        const savedModels = localStorage.getItem("models");
        if (savedModels) {
            models.set(JSON.parse(savedModels));
        }
    }
    updateFilteredModels(); 
}

async function checkAPIConnection() {
  if (!localApiTextField) {
    showMessage.set("yellow");
    apiCheckMessage.set("API key is missing.");
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localApiTextField}`,
        'Content-Type': 'application/json'
      },
    });

    if (response.ok) {
      showMessage.set("green");
      apiCheckMessage.set("API connection succeeded.");
      // Optionally, reload settings or models here
      handleSave();
      await fetchModels(apiTextField);
      updateFilteredModels(); 
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("API connection failed:", error);
    showMessage.set("red");
    apiCheckMessage.set("API connection failed.");
  }
}



async function fetchModels(apiKey: string) {
  if (!apiKey) {
    showMessage.set("yellow");
    console.log("showMessage", showMessage)
    console.error("API key is missing.");
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const sortedModels = data.data.sort((a, b) => a.id.localeCompare(b.id));
    models.set(sortedModels);
    localStorage.setItem("models", JSON.stringify(sortedModels));

    // After models are fetched and set, restore the model selection
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
}

  function clearTokens() {
    combinedTokens.set(0);
  }

  function handleSave() {
  defaultAssistantRole.set({ role: assistantRoleField, type: assistantRoleTypeField });
  apiKey.set(localApiTextField);

  localStorage.setItem('selectedModel', get(selectedModel));
  localStorage.setItem('selectedVoice', get(selectedVoice));
  localStorage.setItem('selectedMode', get(selectedMode));

  dispatch('settings-changed');
  console.log("Settings saved.");
  }





  function handleClose() {
    settingsVisible.set(false);
  }

  function handleSaveAndClose() {
handleSave();
handleClose();
  }

</script>

<!-- Settings.svelte -->
<div class="fixed z-50 inset-0  overflow-y-auto animate-fade-in">
  <div class="flex items-center  justify-center min-h-screen">
    <div class="bg-primary text-white rounded-lg shadow-xl p-8 relative">
      <button
        class="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-600"
        on:click={handleClose}
      >
        <img class="icon-white w-8" alt="Close" src={CloseIcon} />
      </button>
      <h2 class="text-xl font-bold mb-4">Settings</h2>
    <div class="mb-4">
  <label for="api-key" class="block font-medium mb-2">API Key</label>
  <div class="flex items-center">
    <input
      type="password"
      id="api-key"
      name="api-key"
      class="border text-black border-gray-300 p-2 rounded w-full"
      bind:value={localApiTextField}
    />
    <button
      class="ml-2 bg-blue-600 hover:bg-blue-400 transition-colors duration-800 text-white p-2 rounded text-xs"
      on:click={checkAPIConnection}
    >Check API</button>
  </div>
  <p
  class="mt-2 text-white rounded-lg p-2 
  {($showMessage === 'yellow' ? 'bg-yellow-600' : '')} 
  {($showMessage === 'red' ? 'bg-red-600' : '')} 
  {($showMessage === 'green' ? 'bg-green-600' : '')}"
  style="display: {showMessage ? 'block' : 'none'};">
  { $apiCheckMessage }
</p>

</div>


      <div class="mb-4">
        <label for="mode-selection" class="block font-medium mb-2">Mode Selection</label>
        <select bind:value={$selectedMode} class="border text-black border-gray-300 p-2 rounded w-full" id="mode-selection">
          <option value="GPT">GPT</option>
          <option value="GPT + Vision">GPT + Vision</option>
          <option value="Dall-E">Dall-E</option>
          <option value="TTS">TTS</option>
        </select>
      </div>
      

      <div class="mb-4">
        <label for="model-selection" class="block font-medium mb-2">Model Selection</label>
       <select bind:value={$selectedModel} class="border text-black border-gray-300 p-2 rounded w-full" id="model-selection">
    {#each $filteredModels as model}
        <option value={model.id}>{model.id}</option>
    {/each}
</select>
      </div>
      {#if $selectedModel.startsWith('tts')}
<div class="mb-4">
  <label for="voice-selection" class="block font-medium mb-2">Voice Selection</label>
  <select bind:value={$selectedVoice} class="border text-black border-gray-300 p-2 rounded w-full" id="voice-selection">
    <option value="alloy">Alloy</option>
    <option value="echo">Echo</option>
    <option value="fable">Fable</option>
    <option value="onyx">Onyx</option>
    <option value="nova">Nova</option>
    <option value="shimmer">Shimmer</option>
  </select>
</div>
{/if}


{#if $selectedModel.startsWith('dall-e')}
<div class="mb-4">
  <label for="size-selection" class="block font-medium mb-2">Image Size</label>
  <select bind:value={$selectedSize} class="border text-black border-gray-300 p-2 rounded w-full" id="size-selection">
    <option value="1024x1024">1024x1024</option>
    <option value="1024x1792">1024x1792</option>
    <option value="1792x1024">1792x1024</option>
  </select>
</div>
<div class="mb-4">
  <label for="quality-selection" class="block font-medium mb-2">Image Quality</label>
  <select bind:value={$selectedQuality} class="border text-black border-gray-300 p-2 rounded w-full" id="quality-selection">
    <option value="standard">standard</option>
    <option value="hd">hd</option>
  </select>

</div>
{/if}


<div class="mb-4">
  <label for="api-key" class="block font-medium mb-2">Default Assistant role</label>
  <input class="border text-black border-gray-300 p-2 rounded w-full" bind:value={assistantRoleField} />
  <div class="flex items-center my-2 space-x-2">
    <select bind:value={assistantRoleTypeField} class="text-black p-2 rounded focus:outline-none focus:bg-white max-w-24">
      <option value="system">System</option>
      <option value="user">User</option>
    </select>
    <a href="https://platform.openai.com/docs/guides/prompt-engineering/tactic-ask-the-model-to-adopt-a-persona" target="_blank" rel="noreferrer" class="text-blue-300 transition underline text-xs hover:text-blue-500">Which should I use?</a>
  </div>
</div>

      <div class="flex justify-between items-start">
        <div class="flex flex-col">
          <p class="font-bold mb-2">
            Estimated Token Usage: {$combinedTokens.toFixed(0)}
          </p>
          <p class="">
            Estimated Cost with GPT-4: ${(
              ($combinedTokens / 1000) *
              0.02
            ).toFixed(2)}</p>
             <p class="text-blue-300 transition underline text-xs hover:text-blue-500 mt-2">
              <a href="https://openai.com/pricing" target="_blank" rel="noreferrer" >See all API pricing</a> </p>

              <div class="mt-4">
                <label for="show-tokens-toggle" class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" id="show-tokens-toggle" class="sr-only" bind:checked={showTokensToggle} on:change={handleShowTokensToggleChange}>
                    <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div class="dot absolute left-1 top-1 bg-gray-100 w-6 h-6 rounded-full transition"></div>
                  </div>
                  <div class="ml-3 text-gray-200">
                    Show estimated tokens in sidebar
                  </div>
                </label>
              </div>


        </div>
        <button
          on:click={clearTokens}
          class="bg-warning hover:bg-warningHover transition-colors duration-200 text-white ml-10 px-4 py-2 flex align-middle justify-center rounded"
          style="font-size: 1rem"
        >
          <img class="icon-white w-3" alt="Close" src={CloseIcon} />
        </button>
      </div>
      
      <button
        class="bg-good hover:bg-good2 transition-colors duration-200 text-white py-2 px-4 mt-8 rounded"
        on:click={handleSaveAndClose}>Save</button
      >
    </div>
  </div>
</div>

<style>
  @import '../styles/settings.css';
 
</style>
