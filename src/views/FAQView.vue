<template>
  <main class="grow">
    <section class="bg-white dark:bg-gray-900 h-full">
      <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Frequently asked questions</h2>
        <div class="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
          <div>
            <div class="mb-10">
              <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">Why do I have to keep
                reauthorizing my bands?</h3>
              <p class="text-gray-500 dark:text-gray-400">Without Persistent Permissions, the only way to obtain a
                reference to a Bluetooth Device is to prompt the user to select one. While this makes for a pretty bad UX,
                it's the only way.</p>
            </div>
            <div class="mb-10">
              <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">Is there anything I can
                to do not have to keep reauthorizing?</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-2">Yes! If you're using Chrome, enable the new permissions
                backend for Web Bluetooth by setting the <kbd
                  class="whitespace-nowrap px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">enable-web-bluetooth-new-permissions-backend</kbd>
                flag to Enabled.</p>
              <p class="text-gray-500 dark:text-gray-400">If you're using Edge, enable <kbd
                  class="whitespace-nowrap px-1 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">enable-experimental-web-platform-features</kbd>.
                While this isn't the same as the new permissions backend, you won't have to reauthorize unless you restart
                the browser.</p>
            </div>
          </div>
          <div>
            <div class="mb-10">
              <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">What browser should I
                use?</h3>
              <p class="text-gray-500 dark:text-gray-400">While numerous browsers support the Web Bluetooth API, we
              recommend using Chrome as it has the best support.</p>
            </div>
            <div class="mb-10">
              <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">What version of the Mi
                Smart Band does this support?</h3>
              <p class="text-gray-500 dark:text-gray-400">This website only supports the Mi Smart Band 4, because that's
                all I have to test. PRs for more versions are welcome!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>