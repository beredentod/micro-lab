# Micro Lab

An interactive dashboard for exploring consumer choice under two revenue-equivalent tax systems:

- an **ad valorem tax** on good 1; and
- a **lump-sum reduction in income** equal to the revenue raised by that tax.

Please visit: https://beredentod.github.io/micro-lab/

Micro Lab shows both outcomes on a shared consumption graph and compares their utility consequences over tax rates from 0% to 100%. It is a static browser application built with HTML, CSS, and JavaScript. No account, API key, build process, or external service is required.

## Features

- Four utility specifications:
  - Cobb–Douglas
  - CES
  - Leontief
  - perfect substitutes
- Editable prices, income, preference weights, and tax rate
- Optional constraint keeping $\alpha+\beta=1$
- Hicksian substitution and income-effect decomposition
- Equal-revenue comparison between commodity and lump-sum taxation
- Utility comparison across the full tax-rate range
- Fixed or dynamically adjusting graph axes
- LaTeX-quality notation rendered locally with KaTeX
- Responsive, single-screen desktop dashboard

## Economic setup

The consumer initially faces

$$
p_1x_1+p_2x_2\leq m.
$$

An ad valorem tax $t$ on good 1 changes the budget constraint to

$$
p_1(1+t)x_1+p_2x_2\leq m.
$$

At the resulting optimum $x_1^V(t)$, tax revenue is

$$
R(t)=t p_1x_1^V(t).
$$

The comparison policy keeps original prices but reduces the consumer's budget by exactly this amount:

$$
p_1x_1+p_2x_2\leq m-R(t).
$$

The two policies therefore collect the same revenue at every selected tax rate. The dashboard recomputes both Marshallian optima, their utilities, and the Hicksian decomposition whenever a parameter changes.

## Utility functions

| Model | Utility function | Additional parameter |
| --- | --- | --- |
| Cobb–Douglas | $u(x_1,x_2)=x_1^\alpha x_2^\beta$ | none |
| CES | $u(x_1,x_2)=\left[\frac{\alpha x_1^\rho+\beta x_2^\rho}{\alpha+\beta}\right]^{1/\rho}$ | $\rho=(\sigma-1)/\sigma$ |
| Leontief | $u(x_1,x_2)=\min\{x_1/\alpha,x_2/\beta\}$ | none |
| Perfect substitutes | $u(x_1,x_2)=\alpha x_1+\beta x_2$ | none |

For CES preferences, the elasticity of substitution $\sigma$ ranges from 0.1 to 10. At $\sigma=1$, the dashboard uses the continuous Cobb–Douglas limit.

Utility levels are normalized differently across the four specifications. Comparisons are therefore meaningful **between tax systems within the selected model and parameter setting**, not across different utility families.

## Reading the main graph

The labeled bundles are:

- $A$: original optimum
- $H$: Hicks-compensated optimum
- $V$: optimum under the ad valorem tax
- $L$: optimum under the equal-revenue lump-sum budget reduction

The movement $A\rightarrow H$ is the Hicks substitution effect and $H\rightarrow V$ is the income effect of the ad valorem tax. Because the lump-sum policy does not change relative prices, $A\rightarrow L$ is purely an income effect.

For perfect substitutes, demand may jump between corner solutions. At an exact tie in weighted utility per dollar, Micro Lab displays one optimal allocation by splitting expenditure equally between the two goods.

## Run locally

Requirements:

- [Node.js](https://nodejs.org/) 22 or newer
- Any modern browser
- [Visual Studio Code](https://code.visualstudio.com/) is recommended, but not required

Open the project folder in a terminal and run:

```bash
node server.mjs
```

Then visit [http://localhost:8000](http://localhost:8000).

On Windows, you may instead double-click `start-local.bat`. No `npm install` step is needed because all runtime dependencies are included in the repository.

Run the model tests with:

```bash
node --test model.test.js
```

## Publish with GitHub Pages

1. Push the project files to the `main` branch of a GitHub repository. `index.html` must be in the repository root.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose **main** and **/(root)**, then save.

For a repository named `micro-lab`, the public address will normally be:

```text
https://YOUR-USERNAME.github.io/micro-lab/
```

GitHub Pages does not use `server.mjs`; it serves the static files directly. The included `.nojekyll` file ensures that the bundled assets are delivered without Jekyll processing.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Dashboard structure and controls |
| `styles.css` | Layout and visual design |
| `app.js` | Interface state, rendering, and canvas graphics |
| `model.js` | Consumer-choice and tax calculations |
| `model.test.js` | Numerical and economic consistency tests |
| `vendor/katex/` | Local KaTeX distribution and fonts |
| `server.mjs` | Dependency-free local development server |
| `pse-logo.svg` | Header emblem |

## Validation and limitations

The automated tests cover budget exhaustion, known analytical solutions, CES continuity at $\sigma=1$, Leontief equivalence, perfect-substitute corners and ties, revenue equivalence, Hicksian utility preservation, and the substitution-plus-income decomposition.

Micro Lab is an educational visualization. It illustrates a static two-good consumer problem and does not model labor supply, tax administration, general-equilibrium effects, revenue recycling, or interpersonal welfare comparisons. Utility is an ordinal index, so the displayed utility difference is not a monetary welfare measure.

## Attribution

Micro Lab is an independent educational project created in connection with coursework at the Paris School of Economics. It is not an official PSE website or publication. The PSE name and emblem belong to the Paris School of Economics.

KaTeX is distributed under the MIT License. Its license notice is preserved in [`vendor/katex/LICENSE`](vendor/katex/LICENSE).

No license is granted for the original project code unless a separate license file is added to this repository.
