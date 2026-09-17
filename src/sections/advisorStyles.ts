/**
 * Styles for the Calculators, Pillars, Quiz, Social and Steps sections.
 *
 * Copied VERBATIM from SiteRenderer::baseCss() so the editor canvas and the
 * published page share the same class names and look identical. The two
 * interactive states the PHP page gets from :checked radios (pillars) are
 * mirrored here with `.is-on` classes the React components toggle.
 * Keep in step with the PHP stylesheet.
 */

export const CALC_CSS = `
.tf-cx{--cx-c:var(--color-primary);text-align:left}
.tf-cx-panel,.tf-cx-tab{--cx-soft:color-mix(in srgb,var(--cx-c) 20%,#fff)}
.tf-cx-tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:2px 2px 14px}
.tf-cx-tab{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:10px 18px;border:1.5px solid var(--color-border);border-radius:14px;background:var(--color-bg);color:var(--color-text);font:inherit;cursor:pointer;text-align:left;transition:border-color .2s,box-shadow .2s,transform .2s,background .2s}
.tf-cx-tab:hover{transform:translateY(-2px)}
.tf-cx-tab[aria-selected="true"]{border-color:var(--cx-c);background:color-mix(in srgb,var(--cx-c) 8%,var(--color-bg));box-shadow:0 8px 22px color-mix(in srgb,var(--cx-c) 22%,transparent)}
.tf-cx-tag{margin:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--cx-c)}
.tf-cx-tabt{font-size:15px;font-weight:600}
.tf-cx-panel{padding:30px;border-radius:calc(var(--radius) + 6px);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);box-shadow:0 14px 44px rgba(16,24,40,.08)}
.tf-cx-stacked .tf-cx-panel+.tf-cx-panel{margin-top:26px}
.tf-cx-h{margin:2px 0 6px;font-family:var(--font-heading);font-size:22px;line-height:1.3}
.tf-cx-note{margin:0 0 20px;font-size:14.5px;line-height:1.6;color:var(--color-muted)}
.tf-cx-body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:34px;align-items:start}
.tf-cx-field{margin-bottom:22px}
.tf-cx-lab{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;font-size:14.5px;font-weight:600}
.tf-cx-num{display:inline-flex;align-items:center;gap:3px;padding:6px 10px;border-radius:10px;background:color-mix(in srgb,var(--cx-c) 10%,var(--color-bg));color:var(--cx-c);font-weight:700}
.tf-cx-num input{width:104px;border:0;background:transparent;font:inherit;color:inherit;text-align:right;outline:none;-moz-appearance:textfield;appearance:textfield}
.tf-cx-num input::-webkit-outer-spin-button,.tf-cx-num input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.tf-cx-num em{font-style:normal;font-size:13px}
.tf-cx-field input[type=range]{--pct:50%;width:100%;height:6px;margin:0;border-radius:99px;-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,var(--cx-c) var(--pct),var(--color-border) var(--pct));cursor:pointer}
.tf-cx-field input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:4px solid var(--cx-c);box-shadow:0 2px 8px rgba(0,0,0,.2)}
.tf-cx-field input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid var(--cx-c)}
.tf-cx-out{padding:24px;border-radius:var(--radius);background:color-mix(in srgb,var(--cx-c) 7%,var(--color-surface))}
.tf-cx-big{display:flex;flex-direction:column;margin-bottom:14px}
.tf-cx-big span{font-size:13px;font-weight:600;color:var(--color-muted)}
.tf-cx-big strong{font-family:var(--font-heading);font-size:clamp(28px,3.2vw,38px);line-height:1.15;color:var(--cx-c)}
.tf-cx-big small{font-size:12.5px;color:var(--color-muted)}
.tf-cx-chart{display:flex;align-items:center;gap:18px;margin:4px 0 12px}
.tf-cx-chart svg{width:112px;height:112px;flex:none}
.tf-cx-chart text{font:700 15px var(--font-heading);fill:var(--color-text)}
.tf-cx-chart ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:13.5px}
.tf-cx-chart i{display:inline-block;width:11px;height:11px;margin-right:8px;border-radius:3px;vertical-align:-1px}
.tf-cx-k1{background:var(--cx-soft)}.tf-cx-k2{background:var(--cx-c)}
.tf-cx-rows{list-style:none;margin:6px 0 0;padding:0;border-top:1px dashed var(--color-border)}
.tf-cx-rows li{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px dashed var(--color-border);font-size:14px}
.tf-cx-rows b{white-space:nowrap}
.tf-cx-cta{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:18px;padding:13px 18px;border-radius:var(--radius);background:#11793F;color:#fff;font-weight:700;text-decoration:none}
.tf-cx-warn{margin:0;font-weight:600;color:#B42318}
.tf-cx-disc{max-width:860px;margin:20px auto 0;font-size:12.5px;line-height:1.6;text-align:center;color:var(--color-muted)}
@media(max-width:860px){.tf-cx-body{grid-template-columns:minmax(0,1fr);gap:22px}.tf-cx-panel{padding:20px 16px}.tf-cx-tabs{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;scrollbar-width:none}.tf-cx-tab{flex:none}}
`;

export const PILLARS_CSS = `
.tf-px{text-align:left}
.tf-px-nav{display:grid;grid-template-columns:repeat(var(--px-n,5),minmax(0,1fr));gap:14px;margin-bottom:22px}
.tf-px-pick{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 10px 16px;border:1.5px solid var(--color-border);border-radius:calc(var(--radius) + 4px);background:var(--color-bg);color:var(--color-text);text-align:center;cursor:pointer;font:inherit;transition:transform .25s,box-shadow .25s,border-color .25s,background .25s}
.tf-px-pick:hover{transform:translateY(-3px);border-color:var(--px-c)}
.tf-px-pick.is-on{border-color:var(--px-c);background:color-mix(in srgb,var(--px-c) 10%,var(--color-bg));box-shadow:0 10px 28px color-mix(in srgb,var(--px-c) 25%,transparent);transform:translateY(-3px)}
.tf-px-orb{display:flex;width:60px;height:60px;align-items:center;justify-content:center;border-radius:50%;font-size:28px;background:color-mix(in srgb,var(--px-c) 14%,var(--color-bg));color:var(--px-c)}
.tf-px-pick.is-on .tf-px-orb{background:var(--px-c);color:#fff}
.tf-px-pname{font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--px-c)}
.tf-px-ptitle{font-size:14.5px;font-weight:600;line-height:1.3}
.tf-px-panel{display:none;grid-template-columns:minmax(0,5fr) minmax(0,7fr);overflow:hidden;border-radius:calc(var(--radius) + 8px);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);box-shadow:0 18px 50px rgba(16,24,40,.10)}
.tf-px-panel.is-on{display:grid}
.tf-px-panel.no-img{grid-template-columns:minmax(0,1fr)}
.tf-px-pimg{position:relative;min-height:320px;background:color-mix(in srgb,var(--px-c) 20%,#000)}
.tf-px-pimg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tf-px-pimg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,color-mix(in srgb,var(--px-c) 70%,#000) 100%)}
.tf-px-bigsym{position:absolute;left:22px;bottom:18px;z-index:1;font-size:54px;line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.35))}
.tf-px-pbody{padding:34px 36px;border-top:5px solid var(--px-c)}
.tf-px-kicker{margin:0 0 4px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--px-c)}
.tf-px-sub{margin:0 0 4px;font-size:14px;font-weight:600;color:var(--color-muted)}
.tf-px-title{margin:0;font-family:var(--font-heading);font-size:clamp(22px,2.4vw,30px);line-height:1.25}
.tf-px-tagline{margin:14px 0 0;padding-left:14px;border-left:3px solid var(--px-c);font-size:17px;font-style:italic;line-height:1.55}
.tf-px-text{margin:14px 0 0;font-size:15.5px;line-height:1.7;color:var(--color-muted);white-space:pre-line}
.tf-px-chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0;padding:0;list-style:none}
.tf-px-chips li{padding:6px 13px;border-radius:99px;font-size:13px;font-weight:600;background:color-mix(in srgb,var(--px-c) 11%,var(--color-bg));color:color-mix(in srgb,var(--px-c) 75%,#000)}
.tf-px-cta{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:12px 22px;border-radius:var(--radius);background:var(--px-c);color:#fff;font-weight:700;text-decoration:none}
.tf-px-cards{display:grid;grid-template-columns:repeat(var(--px-n,3),minmax(0,1fr));gap:18px;text-align:left}
.tf-px-card{display:flex;flex-direction:column;overflow:hidden;border-radius:calc(var(--radius) + 4px);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);border-top:4px solid var(--px-c);box-shadow:0 8px 26px rgba(16,24,40,.07)}
.tf-px-img{position:relative;aspect-ratio:4/3}
.tf-px-img img{width:100%;height:100%;object-fit:cover}
.tf-px-top{padding:18px 20px 0}
.tf-px-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;font-size:13px;font-weight:700;background:var(--px-c);color:#fff}
.tf-px-img .tf-px-badge{position:absolute;left:12px;bottom:12px}
.tf-px-cbody{display:flex;flex-direction:column;flex:1;padding:18px 20px 22px}
.tf-px-cbody .tf-px-title{font-size:19px}
.tf-px-cbody .tf-px-tagline,.tf-px-cbody .tf-px-text{font-size:14.5px}
.tf-px-cbody .tf-px-cta{align-self:flex-start;padding:10px 16px;margin-top:16px}
@media(max-width:1024px){.tf-px-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:860px){.tf-px-nav{display:flex;overflow-x:auto;scrollbar-width:none;padding:4px}.tf-px-pick{flex:0 0 118px}.tf-px-panel.is-on{grid-template-columns:minmax(0,1fr)}.tf-px-pimg{min-height:200px}.tf-px-pbody{padding:22px 18px}}
@media(max-width:560px){.tf-px-cards{grid-template-columns:minmax(0,1fr)}}
`;

export const QUIZ_CSS = `
.tf-qz-wrap{max-width:860px;margin:0 auto}
.tf-qz-split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:28px;align-items:start}
.tf-qz-img{overflow:hidden;border-radius:calc(var(--radius) + 6px)}
.tf-qz-img img{width:100%;aspect-ratio:4/5;object-fit:cover}
.tf-qz{padding:28px;border-radius:calc(var(--radius) + 6px);background:var(--color-bg);color:var(--color-text);border:1px solid var(--color-border);box-shadow:0 14px 44px rgba(16,24,40,.08);text-align:left}
.tf-qz-bar{position:relative;height:10px;margin-bottom:22px;border-radius:99px;background:color-mix(in srgb,var(--color-primary) 12%,var(--color-bg))}
.tf-qz-fill{display:block;height:100%;border-radius:99px;background:var(--color-primary);transition:width .35s ease}
.tf-qz-count{position:absolute;right:0;top:14px;font-size:12px;font-style:normal;font-weight:700;color:var(--color-muted)}
.tf-qz-list{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.tf-qz-q{padding:16px 18px;border-radius:var(--radius);border:1px solid var(--color-border)}
.tf-qz-q.tf-qz-done{border-color:color-mix(in srgb,var(--color-primary) 40%,var(--color-border));background:color-mix(in srgb,var(--color-primary) 4%,var(--color-bg))}
.tf-qz-qt{display:flex;gap:10px;margin:0 0 12px;font-size:16px;font-weight:600;line-height:1.45}
.tf-qz-n{flex:none;display:inline-flex;width:26px;height:26px;align-items:center;justify-content:center;border-radius:50%;font-size:13px;background:var(--color-primary);color:var(--color-primary-fg)}
.tf-qz-opts{display:flex;flex-wrap:wrap;gap:8px;padding-left:36px}
.tf-qz-opt{position:relative;cursor:pointer}
.tf-qz-opt input{position:absolute;opacity:0;width:1px;height:1px}
.tf-qz-opt span{display:inline-block;padding:8px 16px;border-radius:99px;border:1.5px solid var(--color-border);font-size:14px;font-weight:600}
.tf-qz-yes input:checked+span{background:#15803D;border-color:#15803D;color:#fff}
.tf-qz-no input:checked+span{background:#B42318;border-color:#B42318;color:#fff}
.tf-qz-unsure input:checked+span{background:#B45309;border-color:#B45309;color:#fff}
.tf-qz-result{display:flex;gap:24px;align-items:flex-start;margin-top:22px;padding:24px;border-radius:var(--radius);background:color-mix(in srgb,var(--color-primary) 7%,var(--color-surface))}
.tf-qz-score{position:relative;flex:none;width:120px;height:120px}
.tf-qz-score svg{width:100%;height:100%}
.tf-qz-score strong{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-size:28px;color:var(--color-text)}
.tf-qz-good{color:#15803D}.tf-qz-mid{color:#B45309}.tf-qz-low{color:#B42318}
.tf-qz-rtext h3{margin:0;font-family:var(--font-heading);font-size:21px}
.tf-qz-rtext p{margin:8px 0 0;font-size:15px;line-height:1.6;color:var(--color-muted)}
.tf-qz-gaps{margin:12px 0 0;padding-left:20px;font-size:14.5px;line-height:1.6}
.tf-qz-cta{display:inline-flex;align-items:center;margin-top:16px;padding:12px 20px;border-radius:var(--radius);background:#11793F;color:#fff;font-weight:700;text-decoration:none}
.tf-qz-reset{margin:16px 0 0 12px;padding:10px 14px;border:0;background:none;font:inherit;font-weight:600;color:var(--color-muted);text-decoration:underline;cursor:pointer}
@media(max-width:860px){.tf-qz-split{grid-template-columns:minmax(0,1fr)}.tf-qz-img img{aspect-ratio:16/10}}
@media(max-width:560px){.tf-qz{padding:18px 14px}.tf-qz-opts{padding-left:0}.tf-qz-result{flex-direction:column;align-items:center;text-align:center}}
`;

export const SOCIAL_CSS = `
.tf-scs{display:grid;grid-template-columns:repeat(var(--sc-cols,3),minmax(0,1fr));gap:16px;text-align:left}
@media(max-width:900px){.tf-scs{grid-template-columns:repeat(min(var(--sc-cols,3),3),minmax(0,1fr))}}
.tf-sc{display:flex;flex-direction:column;gap:6px;padding:20px;border-radius:calc(var(--radius) + 4px);border:1.5px solid var(--color-border);background:var(--color-bg);color:var(--color-text);text-decoration:none;transition:transform .25s,box-shadow .25s,border-color .25s}
.tf-sc:hover{transform:translateY(-4px);border-color:var(--sc);box-shadow:0 14px 34px color-mix(in srgb,var(--sc) 22%,transparent)}
.tf-sc-ic{display:inline-flex;width:52px;height:52px;margin-bottom:6px;align-items:center;justify-content:center;border-radius:14px;background:color-mix(in srgb,var(--sc) 13%,var(--color-bg));color:var(--sc)}
.tf-sc:hover .tf-sc-ic{background:var(--sc);color:#fff}
.tf-sc-t{font-family:var(--font-heading);font-size:17px;font-weight:700}
.tf-sc-x{font-size:14px;line-height:1.5;color:var(--color-muted)}
.tf-sc-a{margin-top:auto;padding-top:6px;font-size:14px;font-weight:700;color:var(--color-text)}
.tf-sc-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.tf-sc-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px 8px 8px;border-radius:99px;border:1.5px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:600;text-decoration:none}
.tf-sc-pill .tf-sc-ic{width:34px;height:34px;margin:0;border-radius:50%}
.tf-sc-pill .tf-sc-ic svg{width:18px;height:18px}
@media(max-width:560px){.tf-scs{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tf-sc{padding:16px 14px}}
`;

export const STEPS_CSS = `
.tf-st{list-style:none;margin:0;padding:0}
.tf-st-horizontal{position:relative;display:grid;grid-template-columns:repeat(var(--st-n,4),minmax(0,1fr));gap:18px}
.tf-st-horizontal::before{content:"";position:absolute;top:32px;left:calc(50% / var(--st-n,4));right:calc(50% / var(--st-n,4));height:3px;border-radius:3px;background:linear-gradient(90deg,var(--color-primary),var(--color-secondary))}
.tf-st-i{position:relative}
.tf-st-horizontal .tf-st-i{display:flex;flex-direction:column;align-items:center;text-align:center}
.tf-st-dot{position:relative;z-index:1;display:inline-flex;width:66px;height:66px;align-items:center;justify-content:center;border-radius:50%;background:var(--color-bg);border:3px solid var(--st-c);color:var(--st-c);font-family:var(--font-heading);font-size:24px;font-weight:700;box-shadow:0 8px 22px color-mix(in srgb,var(--st-c) 25%,transparent)}
.tf-st-t{margin:14px 0 0;font-family:var(--font-heading);font-size:17px;line-height:1.3;color:var(--tf-heading,inherit)}
.tf-st-x{margin:6px 0 0;font-size:14px;line-height:1.55;color:var(--tf-text,var(--color-muted))}
.tf-st-vertical{max-width:760px;margin:0 auto;text-align:left}
.tf-st-vertical .tf-st-i{display:flex;gap:20px;padding-bottom:28px}
.tf-st-vertical .tf-st-i:not(:last-child)::before{content:"";position:absolute;left:32px;top:66px;bottom:0;width:3px;background:color-mix(in srgb,var(--st-c) 35%,transparent)}
.tf-st-vertical .tf-st-t{margin-top:8px}
.tf-st-cta{margin-top:32px;text-align:center}
@media(max-width:860px){.tf-st-horizontal{grid-template-columns:minmax(0,1fr);max-width:520px;margin:0 auto;text-align:left}.tf-st-horizontal::before{display:none}.tf-st-horizontal .tf-st-i{flex-direction:row;align-items:flex-start;gap:16px;text-align:left}.tf-st-horizontal .tf-st-t{margin-top:8px}.tf-st-dot{flex:none;width:54px;height:54px;font-size:20px}}
`;
