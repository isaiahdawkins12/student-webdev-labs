## Code Review Exercise

Write your code review here in markdown format.

### Issue #1: Form buttons outside of form element

Issue 1 is located in index.html at the very end of the file on lines 493-498. The form buttons are on the outside of the submission form and because of that they wont act on the form when pressed.

Initial Code:

```html
        ></textarea>
      </form>
      <div
        class="form space-evenly-distributed-row-container form-buttons-container"
      >
        <input class="form-button" type="submit" value="submit" />
        <input class="form-button" type="reset" value="reset" />
      </div>
    </div>

```

Fixed Code:

```html
   <textarea
          class="form-textarea form-element-container"
          name="message"
          id="message"
          cols="30"
          rows="10"
        ></textarea>

      <div
        class="form space-evenly-distributed-row-container form-buttons-container"
      >
        <input class="form-button" type="submit" value="submit" />
        <input class="form-button" type="reset" value="reset" />
      </div>
    </form>
    </div>
```

### Issue #2: Load new cat facts doesn't work

The current issue with load new cat facts is that it simply doesn't load NEW facts after the initial set! Then, when you enable that to work, we have the issue that it just appends loading containers to a list of them and you just get more and more loading containers on the page. Finally, when you do get it to load properly, it appears that the initial API call doesn't actually get new facts, it just grabs the same facts each time and lists them on the page.

The way we solve this is in a couple of steps:

1. The finally block in lines 49-52 of index.js overwrite the element's class which strips the loading container. The next call to createLoadingContainer calls querySelector('.loading-container'), gets null and null.append(loader) throws an error before the fetch ever runs. We solve it by never destroying the class and instead managing the contents!

<img src="/10-debugging/sample-website/images/Screenshot 2026-06-03 081158.png" alt="bug 2 append null error">

2. The loading gifs start to append when you click "Load New Cat Facts" and thats just a small graphical error. We change loadingContainer.append(loader) to loadingContainer.replaceChildren(loader) so that the container contains exactly one loader element.

3. Finally, we want to get actual new facts each time we call the endpoint at catfact.ninja and so we add a semi-random page to the end of the call using the Math library. This allows us to jump to different pages and grab a different 10 facts instead of displaying the same 10 each time.

Initial Code:

```js
const createLoadingContainer = function () {
  const loadingContainer = document.querySelector(".loading-container");
  const loader = document.createElement("img");
  loader.src = "../../images/loader.gif";
  loader.alt = "loader gif while the data loads";
  loader.width = 60;
  loader.height = 60;
  loadingContainer.append(loader);
};

const fetchCatFacts = async function () {
  const catFactsList = document.getElementById("cat-facts-list");
  catFactsList.replaceChildren();

  createLoadingContainer();

  try {
    const response = await fetch("https://catfact.ninja/facts?limit=10");
    const data = await response.json();

    data.data.forEach((element) => {
      const catFactItem = document.createElement("p");
      catFactItem.setAttribute("class", "cat-fact-list-item");
      catFactItem.textContent = element.fact;
      catFactsList.append(catFactItem);
    });
  } catch (error) {
    console.error("Error fetching cat facts:", error);
  } finally {
    const loading = document.querySelector(".loading-container");
    loading.setAttribute("class", "display-none");
  }
};
```

Final Code:

```js
const createLoadingContainer = function () {
  const loadingContainer = document.querySelector(".loading-container");
  loadingContainer.classList.remove("display-none"); // Bug 2 fix 1
  const loader = document.createElement("img");
  loader.src = "../../images/loader.gif";
  loader.alt = "loader gif while the data loads";
  loader.width = 60;
  loader.height = 60;
  loadingContainer.replaceChildren(loader); // Bug 2 fix 2
};

const fetchCatFacts = async function () {
  const catFactsList = document.getElementById("cat-facts-list");
  catFactsList.replaceChildren();

  createLoadingContainer();

  try {
    const rand_page = Math.floor(Math.random() * 33) + 1; // Bug 2 fix 3
    const response = await fetch(
      `https://catfact.ninja/facts?limit=10&page=${rand_page}`,
    ); // Bug 2 fix 3
    const data = await response.json();

    data.data.forEach((element) => {
      const catFactItem = document.createElement("p");
      catFactItem.setAttribute("class", "cat-fact-list-item");
      catFactItem.textContent = element.fact;
      catFactsList.append(catFactItem);
    });
  } catch (error) {
    console.error("Error fetching cat facts:", error);
  } finally {
    const loading = document.querySelector(".loading-container");
    loading.classList.add("display-none"); // Bug 2 fix 1
  }
};
```
