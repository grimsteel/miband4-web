<template>
  <main class="grow">
    <section class="bg-white dark:bg-gray-900 h-full">
      <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Frequently asked questions</h2>
        <div class="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
          <div>
            <FAQItem title="Why do I have to keep reauthorizing my bands?" id="why-reauthorize">
              <FAQItemText>Without Persistent Permissions, the only way to obtain a
                reference to a Bluetooth Device is to prompt the user to select one. While this makes for a pretty bad UX,
                it's the only way.</FAQItemText>
            </FAQItem>
            <FAQItem title="Is there anything I can to do not have to keep reauthorizing?" id="stop-reauthorizing">
              <FAQItemText>Yes! If you're using Chrome, enable the new permissions
                backend for Web Bluetooth by setting the <kbd
                  class="whitespace-nowrap px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">enable-web-bluetooth-new-permissions-backend</kbd>
                flag to Enabled.</FAQItemText>
                <FAQItemText>If you're using Edge, enable <kbd
                  class="whitespace-nowrap px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">enable-experimental-web-platform-features</kbd>.
                While this isn't the same as the new permissions backend, you won't have to reauthorize unless you restart
                the browser.</FAQItemText>
            </FAQItem>
            <FAQItem title="Is there anything I can do to make my bands connect faster?" id="connect-faster">
              <FAQItemText>Sometimes, if the band "goes out of range" (according to the browser), we have to scan for advertisments to reconnect.
                (You can tell if this is happening if the tab displays the scanning icon.)</FAQItemText>
              <FAQItemText>This can be solved by going to your browser's bluetooth-internals page, connecting to the device, and disconnecting.</FAQItemText>
              <FAQItemText>This is a <a href="https://crbug.com/1173186" class="text-blue-600 hover:underline dark:text-blue-500" target="_blank">known bug in Chromium</a>. Star it if you want it to be fixed!</FAQItemText>
            </FAQItem>
          </div>
          <div>
            <FAQItem title="What browser should I use?" id="browser-version">
              <FAQItemText class="text-gray-500 dark:text-gray-400">While numerous browsers support the Web Bluetooth API, we
                recommend using Chrome as it has the best support.</FAQItemText>
            </FAQItem>
            <FAQItem title="What version of the Mi Smart Band does this support?" id="mi-band-version">
              <FAQItemText class="text-gray-500 dark:text-gray-400">This website only supports the Mi Smart Band 4, because that's
                all I have to test. PRs for more versions are welcome!</FAQItemText>
            </FAQItem>
            <FAQItem title="What should I do if it gets stuck while fetching activity data?" id="stuck-fetching">
              <FAQItemText>First, check to see if the band is still connected. The default watch screens show the Bluetooth icon when the band is <span class="italic">not connected</span>.</FAQItemText>
              <FAQItemText>If this is the case, reload and start fetching activity data again. If everything goes well, it will resume from where it left off.</FAQItemText>
              <FAQItemText>If the band is not connected, turn Bluetooth off and on, and connect/disconnect from bluetooth-internals. Then, reload and resume fetching.</FAQItemText>
            </FAQItem>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import FAQItem from '../components/FAQItem.vue'
  import FAQItemText from '../components/FAQItemText.vue';

  onMounted(() => {
    const currentHash = window.location.hash;
    window.location.hash = '';
    window.location.hash = currentHash;
  });
</script>