<script setup lang="ts">
  import BetaBanner from '../components/BetaBanner.vue';
  import BrowserSupportListItem from '../components/BrowserSupportListItem.vue';
  import FeatureTag from '../components/FeatureTag.vue';
  import HomepageFeature from '../components/HomepageFeature.vue';
  import IconBell from "../components/icons/IconBell.vue";
  import IconChart from "../components/icons/IconChart.vue";
  import IconClock from "../components/icons/IconClock.vue";
  import IconComputer from '../components/icons/IconComputer.vue';
  import IconGithub from '../components/icons/IconGithub.vue';
  import IconHeart from "../components/icons/IconHeart.vue";
  import IconHiking from "../components/icons/IconHiking.vue";
  import IconPrivate from "../components/icons/IconPrivate.vue";
  import IconWarning from "../components/icons/IconWarning.vue";
  import { useConfigStore } from "../pinia-stores";

  const configStore = useConfigStore();

  const isProduction = import.meta.env.PROD;
</script>

<template>
  <main>
    <section class="bg-white dark:bg-gray-900 relative">
        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl dark:text-white">Mi Band 4 Web</h1>
            <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">A lightweight web interface for the Mi Smart Band 4 that can run entirely offline. Use in any browser that supports the Web Bluetooth API</p>
            <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
              <router-link to="/bands/add" class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center rounded-lg bg-gradient-to-br text-white from-orange-500 via-red-600 to-rose-700 hover:bg-gradient-to-tl focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 shadow-lg shadow-rose-500/50 dark:shadow-lg dark:shadow-rose-800/80 bg-rose-700 hover:bg-rose-800">
                Add a band
                <svg aria-hidden="true" class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </router-link>
              <a href="https://github.com/grimsteel/miband4-web" class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                <IconGithub class="w-4 h-4 mr-2 ml-1" />
                GitHub
              </a>  
            </div>
        </div>
        <div class="bg-gradient-to-b from-orange-100 dark:to-transparent dark:from-gray-800  w-full h-full absolute top-0 left-0 z-0"></div>
    </section>
    <BetaBanner v-if="isProduction && configStore.showBetaBanner" @close="configStore.stopShowingBetaBanner()" />
    <section class="bg-white dark:bg-zinc-900">
      <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div class="max-w-screen-md mb-8 lg:mb-16">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Features</h2>
          <p class="text-gray-500 sm:text-sl dark:text-gray-400">Note that this app is still in development, and I plan to gradually support more features over time!</p>
        </div>
        <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          <HomepageFeature title="100% Offline" description="Can run entirely offline, and none of your data is ever sent to any external servers. In fact, we don't have any servers at all!" :icon="IconPrivate" />
          <HomepageFeature title="Cross-Browser" description="Works in any browser that supports the Web Bluetooth API" :icon="IconComputer" />
          <HomepageFeature title="Steps" description="Track your daily steps and view statistics from the past" :icon="IconHiking" />
          <HomepageFeature title="Stats" description="Detailed battery stats, hardware info, and more" :icon="IconChart" />
          <HomepageFeature title="Alarms" description="Create, update, and delete your band's alarms" :icon="IconBell">
            <template v-slot:tag>
              <FeatureTag classes="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-400" text="Experimental" :icon="IconWarning" />
            </template>
          </HomepageFeature>
          <HomepageFeature title="Heart Rate" description="View and stream your heart rate" :icon="IconHeart">
            <template v-slot:tag>
              <FeatureTag classes="bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-400" text="Coming soon!" :icon="IconClock" />
            </template>
          </HomepageFeature>
        </div>
      </div>
    </section>
    <section class="bg-zinc-100 dark:bg-zinc-800">
      <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6 divide-y divide-slate-500">
        <div class="md:grid md:grid-cols-2 md:gap-12 pb-3">
          <div>
            <div class="max-w-screen-md mb-8 lg:mb-16">
              <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Browser Support</h2>
              <p class="text-gray-600 sm:text-sl dark:text-gray-400">For best results, use Chrome, as it has the best support for the Web Bluetooth API.</p>
            </div>
            <ul role="list" class="max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
              <BrowserSupportListItem browser="Chrome" since-version="56" />
              <BrowserSupportListItem browser="Edge" since-version="79" />
              <BrowserSupportListItem browser="Safari" />
              <BrowserSupportListItem browser="Firefox" />
              <BrowserSupportListItem browser="Opera" since-version="43 (Requires flag)" />
              <BrowserSupportListItem browser="Internet Explorer" />
              <BrowserSupportListItem browser="Chrome for Android" since-version="111" />
              <BrowserSupportListItem browser="Samsung Internet" since-version="6.2" />
            </ul>
          </div>
          <div>
            <div class="max-w-screen-md mb-8 lg:mb-16">
              <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">OS Support</h2>
              <p class="text-gray-600 sm:text-sl dark:text-gray-400">Support for the Web Bluetooth API currently <a href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md" target="_blank" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">varies by OS</a></p>
            </div>
            <ul role="list" class="max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
              <BrowserSupportListItem browser="Chrome OS" since-version="" />
              <BrowserSupportListItem browser="Android" since-version="6.0" />
              <BrowserSupportListItem browser="Mac" since-version="OS X Yosemite"/>
              <BrowserSupportListItem browser="Linux" since-version="Requires flag" />
              <BrowserSupportListItem browser="Windows" since-version="Windows 10 version 1703" />
              <BrowserSupportListItem browser="iOS" />
            </ul>
          </div>
        </div>
        <p class="text-gray-600 sm:text-sl dark:text-gray-400 pt-3">For more information, see the <a href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md" target="_blank" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">implementation status</a> page.</p>
      </div>
    </section>
  </main>
</template>
