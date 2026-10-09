# Micro Lab

An interactive, public-ready two-good consumption visualizer. A single-view desktop dashboard compares an ad valorem tax with an equal-revenue lump-sum budget tax across four utility families. Both consumption outcomes appear on the same graph; the utility-rate chart and results sit beside it. KaTeX 0.16.22 and its fonts are bundled locally for LaTeX-quality math, including offline. No package installation, external requests, account, or API key is needed.

## 1. Test it on your own computer

Recommended editor: **Visual Studio Code**, available at https://code.visualstudio.com/.
Install the **LTS version of Node.js** from https://nodejs.org/ (Node 22 or newer).
Node is only needed to run the local development server and optional tests. GitHub Pages does not run Node.

1. Extract the downloaded ZIP to a convenient folder, such as Documents.
2. In VS Code, choose **File > Open Folder** and select the `micro-lab` folder containing `index.html` and `package.json`.
3. Choose **Terminal > New Terminal**.
4. Run:

   ```sh
   node server.mjs
   ```

5. Open **http://localhost:8000** in your browser. Leave the terminal running.
6. Edit a file, save it, and refresh your browser to see your changes. There is no automatic refresh.
7. Stop the server with **Ctrl+C**.

On Windows you can also double-click **start-local.bat** after installing Node, then open the same address. Alternatively, in VS Code use **Terminal > Run Task > Start local website**.

There is no `npm install` step. `npm start` is another way to start the server, but `node server.mjs` avoids Windows PowerShell restrictions on npm scripts.

The files are ready for local use; you still need to install the editor and Node on your computer. A server running in ChatGPT's workspace does not make localhost available on your computer.

### Troubleshooting

- **Node not recognized:** install Node LTS and restart VS Code.
- **Port 8000 is busy:** stop the previous server using Ctrl+C. To use another port in PowerShell: `$env:PORT=8001; node server.mjs`, then open http://localhost:8001.
- **Graph missing when double-clicking index.html:** use the local server. JavaScript modules should be served over HTTP.
- **Changes not visible:** save the file and refresh. For an online page, allow deployment to finish and try Ctrl+Shift+R.

## 2. Publish it publicly with GitHub Pages

This package is not yet published to a GitHub account. Follow these steps to put it online:

1. Sign in at https://github.com/ and create a **new public repository** named `micro-lab`. You can initialize it with a README so that the upload controls are easy to find.
2. On the repository's **Code** tab, choose **Add file > Upload files**.
3. Open your extracted folder and upload its **contents**, not the ZIP or the outer folder. In particular, `index.html`, `styles.css`, `app.js`, `model.js`, `favicon.svg`, and `pse-logo.svg` must sit at the repository's top level. Upload the `vendor` folder too: it contains the math renderer and fonts. You can upload the other files too. Hidden `.nojekyll` and `.vscode` files are included in the ZIP; they are optional for this plain HTML site.
4. Click **Commit changes** to save the files to `main`.
5. Open **Settings > Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Choose branch **main**, folder **/(root)**, and click **Save**.
8. Wait for deployment. GitHub says it can take up to 10 minutes. Refresh the Pages settings to find the actual published link.

For a repository named `micro-lab`, the address will normally be:

```text
https://YOUR-GITHUB-USERNAME.github.io/micro-lab/
```

Replace YOUR-GITHUB-USERNAME with your username. Anyone with the link will be able to visit without signing in. In a public repository the code is also public.

No build command, paid hosting, or GitHub Actions file is required. All asset paths are relative, so the site works under a repository subpath. The included local server is not used on GitHub Pages.

## 3. Make future changes

The simplest approach is to edit and test locally, then use **Add file > Upload files** again to upload the changed files to the same location. Commit the changes and GitHub Pages republishes them.

For a smoother workflow later, install Git (https://git-scm.com/), then clone your repository through VS Code's **Source Control > Clone Repository**. Open the cloned folder, copy your edited files into it, test locally, and use **Source Control** to stage, commit, and sync your changes. After that, always edit the cloned folder so local changes stay connected to GitHub.

## What the files do

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, labels, and default inputs |
| `styles.css` | Layout, colors, typography, and mobile styling |
| `app.js` | Controls and canvas drawing |
| `model.js` | Economic formulas for both tax systems |
| `vendor/katex/` | Bundled math renderer, fonts, and MIT license |
| `favicon.svg` | Small browser-tab icon |
| `pse-logo.svg` | PSE emblem in the page header |
| `server.mjs` | Dependency-free local server, bound to your own computer |
| `start-local.bat` | Windows double-click launcher |
| `package.json` | Project metadata and optional npm commands |
| `model.test.js` | Checks the economics |
| `.vscode/tasks.json` | VS Code task for starting the local server |
| `.nojekyll` | Tells GitHub Pages to serve plain static files |
| `.gitignore` | Excludes unnecessary local files from Git |

## Dashboard and utility selection

The single consumption graph, smaller utility-rate chart, results panel, and controls share one desktop dashboard. Narrow screens or short windows use a stacked layout for readability.

Choose exactly one utility family using the four radio buttons styled as buttons:

| Model | Utility | Parameters |
| --- | --- | --- |
| Cobb–Douglas | x1^alpha * x2^beta | alpha, beta |
| General CES | [(alpha*x1^rho + beta*x2^rho)/(alpha+beta)]^(1/rho) | alpha, beta, sigma; rho = (sigma-1)/sigma |
| Leontief | min(x1/alpha, x2/beta) | alpha, beta set required proportions |
| Perfect substitutes | alpha*x1 + beta*x2 | alpha, beta |

CES elasticity sigma ranges from 0.1 to 10. At sigma=1, the continuous limit (x1^alpha*x2^beta)^(1/(alpha+beta)) is used. The CES formula normalizes its weights by alpha+beta so this limit exists even with unlocked weights. This normalization does not constrain the two controls: they remain independently editable, and their ratio determines preferences. These formulas have different normalizations: compare utility between tax treatments within a chosen model, not levels across models. The weighted Leontief formulation is not the literal sigma→0 limit of the stated weighted CES family (that limit is min(x1,x2)).

All models spend the available budget. General CES demand uses expenditure shares proportional to alpha^sigma * price1^(1-sigma) and beta^sigma * price2^(1-sigma). Leontief demand lies at the kink. Perfect substitutes spend everything on the good with higher weighted utility per dollar. At an exact tie, this app splits spending 50/50. That is one of many optimal bundles; revenue at the tie depends on this convention.

Perfect-substitute revenue can jump when consumption switches goods. Utility comparisons display a gap at that jump and a dot for the tie convention instead of drawing a misleading continuous connection. With Leontief, the two tax treatments give identical bundles and utility.

For every model, revenue is computed as t*p1*x1 at the ad valorem optimum. The lump-sum optimum is then recomputed at original prices and budget m minus that revenue. The utility chart recomputes this comparison separately at each tax rate.

## Independent weights and locking

Alpha and beta each have a slider. With **Lock alpha + beta = 1** enabled, moving either slider moves the other in the opposite direction, maintaining the sum exactly at 1. Locked weights range from 0.05 to 0.95. Unlock to set either independently from 0.05 to 2.00. Enabling the lock normalizes their current ratio, rounded to slider precision and clamped to the supported range. Reset restores 0.50/0.50 and enables the lock.

Changing both Cobb–Douglas exponents by the same factor changes the utility scale but not demand. CES uses normalized weights explicitly in its displayed formula to provide a continuous sigma=1 limit. Compare utility within a fixed preference setting, not across different weight settings or models.

## Hicks substitution and income effects

The combined graph marks **A** (original optimum), **H** (compensated optimum), **V** (ad valorem optimum), and **L** (income-tax optimum). A purple dashed budget line supports the original utility at the final prices. Purple arrows A→H show the substitution effect; orange arrows H→V show the income effect. Numerical effects appear in the **Results at selected tax** panel as ordered pairs (change in good 1, change in good 2). These arrows connect bundles, not paths of actual adjustment. Close or identical markers are labeled together.

For the ad valorem tax, Hicks compensation restores the original utility at prices (p1*(1+t),p2). With utility homogeneous of degree d, compensated income is m*(u_original/u_after_tax)^(1/d). Here d=alpha+beta for Cobb–Douglas and d=1 for the other models. The optimum at this income is H, so the two effects sum exactly to V−A.

For the lump-sum budget tax, prices do not change. The compensated budget is the original budget, H=A, and the substitution effect is zero. All quantity changes are income effects. Leontief also has zero substitution effect under the ad valorem tax.

## Combined tax graph

The main graph always shows the ad valorem budget and the equal-revenue income-tax budget together. Both budget lines are solid and each affordable region is lightly shaded. The legend distinguishes the budgets and chosen indifference curves. Background indifference curves are pale; chosen curves are thin, solid, and color coded. **Fixed scale** is active by default and keeps the current axis numbers while the graph moves. Switch to **Dynamic scale** to fit the axes to the current settings. The smaller utility-rate chart and selected-rate results sit to the right of the graph.

**V** labels the ad valorem optimum in blue; **L** labels the equal-revenue budget-tax optimum in brown. **A** is the original optimum and **H** is the Hicks-compensated optimum for the ad valorem tax. The point labels are bold and color coded. A→H→V decomposes the ad valorem tax effects. A→L is the budget tax's pure income effect. Overlapping points share a combined label.

The results panel reports the utility difference `u_L - u_V`. Utility is an index, so the difference is not a monetary welfare measure.

## Cobb–Douglas example and formulas

Preferences: `u(x1,x2) = x1^alpha * x2^beta`. Let `a = alpha/(alpha+beta)` and `b = beta/(alpha+beta)`.
Defaults: `p1 = 2`, `p2 = 3`, `m = 120`, `alpha = beta = 0.5`, `t = 0`.

### Graph 1: ad valorem tax

The displayed tax runs from 0 to 100%. Internally `t` is a fraction from 0 to 1. The consumer price of good 1 is `p1*(1+t)`. Good 2 is untaxed. A 100% tax doubles good 1's price.

```text
Budget: p1*(1+t)*x1 + p2*x2 <= m
x1_V = a*m / (p1*(1+t))
x2_V = b*m / p2
Revenue R(t) = t*p1*x1_V = a*m*t/(1+t)
```

Revenue uses consumption AFTER the tax. Tax revenue is not rebated.

### Equal-revenue income tax

Original prices apply. Deduct a lump sum equal to the revenue from graph 1. This is a lump-sum budget tax, not a tax rate applied to income and not a tax on good 2.

```text
Income-tax budget = m-R(t)
Budget: p1*x1 + p2*x2 <= m-R(t)
x1_L = a*(m-R(t))/p1
x2_L = b*(m-R(t))/p2
```

By default, the main graph axes keep their initial limits while the tax rate or inputs change. Turn on **Dynamic scale** to adapt to the current intercepts. At zero tax, the original and current budget lines overlap.

### Utility over the full tax range

Let `u0` be utility at the untaxed optimum. Cobb–Douglas homogeneity of degree alpha+beta gives:

```text
u_V(t) = u0 / (1+t)^alpha
u_L(t) = u0 * (1-a*t/(1+t))^(alpha+beta)
```

Each point compares taxes with equal revenue at that particular rate. Changing the tax slider moves only the selection line and markers; the complete curves stay fixed. Prices, budget, or preferences change the curves. The vertical axis starts at zero and displays the utility index, not currency.

For Cobb–Douglas the budget tax gives higher utility for every positive tax rate. In the other models it gives weakly higher utility; equality can occur. At zero tax the curves coincide.

### Numerical check

At the defaults with `t=100%`:

| Quantity | Ad valorem | Budget tax |
| --- | --- | --- |
| Revenue | 30 | 30 |
| Optimal good 1 | 15 | 22.5 |
| Optimal good 2 | 20 | 15 |
| Utility | 17.3205 | 18.3712 |

Input prices and original budget are restricted to 0.01–1,000,000, and each unlocked weight to 0.05–2.00. The remaining budget may be below 0.01 and is still computed correctly. Invalid inputs leave the last valid graphs on screen.

## Extending the dashboard

The consumption graph, utility-rate graph, and results panel are separate dashboard columns in `index.html`; CSS grid controls their positions. `app.js` shares one parameter state and a reusable canvas drawing helper; `model.js` contains the optimization and utility formulas.

Equations use bundled KaTeX and its fonts. Preserve `vendor/katex/LICENSE` when distributing the project.

## Validation

Run `node --test model.test.js`.

Tests check known optima, budget exhaustion, tangency, utility maximization along the budget across all four models, equal-revenue welfare, CES at sigma=1, Leontief equivalence, substitutes corners and ties, the full tax range, independent weights, Hicks utility preservation, decomposition adding up, and input extremes.

## Updating the previous version

Replace the old project files with the contents of this folder, including `vendor/`. Restart your local server. All browser-visible branding and project metadata now say Micro Lab.

For a new GitHub repository, use `micro-lab`. If you already published the previous version, you can keep its repository name and URL, or rename the repository to `micro-lab` in GitHub settings. Check **Settings > Pages** afterward for the resulting public address.

## Official setup references

- GitHub Pages publishing: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages quickstart: https://docs.github.com/en/pages/quickstart
- VS Code terminal: https://code.visualstudio.com/docs/terminal/getting-started
