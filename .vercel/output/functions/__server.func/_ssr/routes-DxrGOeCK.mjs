import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DxrGOeCK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		className,
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "24",
				r: "11",
				className: "stroke-muted",
				strokeWidth: "1.75",
				strokeDasharray: "56.8 12.3",
				strokeDashoffset: "6.15"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M5 24H34",
				className: "stroke-signal",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "34",
				y: "21",
				width: "6",
				height: "6",
				className: "fill-signal"
			})
		]
	});
}
function Wordmark({ markClass = "size-8" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: markClass }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium tracking-widest text-fg lowercase",
			children: "phantomlink"
		})]
	});
}
var focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
var samples = [
	{
		id: "boiler",
		place: "Boiler house",
		bus: "Modbus RTU",
		lines: [
			"slave 01   fn 03",
			"addr 000B  qty 0001",
			"raw  19 40"
		],
		caption: "Holding 40012 · 4–20 mA",
		asset: "boiler-3",
		point: "discharge pressure",
		value: "6.4 bar",
		state: "drifting",
		confidence: "0.91"
	},
	{
		id: "cold",
		place: "Cold room",
		bus: "4–20 mA",
		lines: [
			"loop AI-14",
			"12.80 mA",
			"span 0–10 °C"
		],
		caption: "Analog input · unscaled",
		asset: "line-2",
		point: "room temperature",
		value: "4.1 °C",
		state: "steady",
		confidence: "0.97"
	},
	{
		id: "ahu",
		place: "Air handler",
		bus: "BACnet",
		lines: [
			"device 2401",
			"AV:22 present-value",
			"71.4"
		],
		caption: "OPC classic mirror",
		asset: "ahu-1",
		point: "supply air",
		value: "71.4 °F",
		state: "high",
		confidence: "0.88"
	}
];
var miles = [
	["01", "Most industrial points predate an API."],
	["02", "Historians trap the data and never name it."],
	["03", "The work dies on the machine, not the model."]
];
var steps = [
	{
		k: "01",
		name: "Haunt",
		body: "An edge agent sits on the bus you already have. No firmware rewrite. The PLC keeps its job.",
		detail: "Modbus · OPC classic · BACnet · S7 · serial"
	},
	{
		k: "02",
		name: "Name",
		body: "Holding register 40012 becomes discharge pressure. Units align. Time aligns. The point gets an asset.",
		detail: "40012  →  discharge pressure"
	},
	{
		k: "03",
		name: "Speak",
		body: "Agents don't get another dashboard. They get tools: read a point, explain a drift, subscribe to an alarm.",
		detail: "read_asset · explain_drift · subscribe_alarm"
	}
];
var protocols = [
	["Modbus RTU / TCP", "Registers, coils, raw frames"],
	["OPC Classic", "DA servers with no REST port"],
	["BACnet", "Points still named AV:22"],
	["Siemens S7", "DB blocks, left untouched"],
	["Allen-Bradley", "Tags behind a serial rack"],
	["4–20 mA & serial", "Loops and ports with no packet"]
];
var facts = [
	["Commissioned", "1998"],
	["Points", "140"],
	["APIs", "0"],
	["To a reason", "40 min"]
];
function signalState(state) {
	return state === "steady" ? "text-fg" : "text-signal";
}
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "top",
		className: "bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#top",
							className: focus,
							"aria-label": "Phantomlink, top",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden items-center gap-6 md:flex",
							"aria-label": "Page",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#bridge",
									className: `text-sm text-muted hover:text-fg ${focus}`,
									children: "Protocol"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#agents",
									className: `text-sm text-muted hover:text-fg ${focus}`,
									children: "Agents"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#deploy",
									className: `text-sm text-muted hover:text-fg ${focus}`,
									children: "Deploy"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#walk",
							className: `inline-flex h-11 shrink-0 items-center bg-signal px-4 text-sm font-medium whitespace-nowrap text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`,
							children: "Walk my plant"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-6xl px-5 pt-16 pb-8 md:pt-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rise font-mono text-xs tracking-widest text-signal uppercase",
							children: "Registers in. Reasons out."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "rise rise-2 mt-4 max-w-3xl text-4xl leading-tight font-medium tracking-tight md:text-6xl",
							children: "Silent machines. Speaking models."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rise rise-3 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg",
							children: "Phantomlink turns registers, pulses, and forgotten protocols into a stream any agent can reason over — without ripping out the plant."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#translate",
								className: `inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`,
								children: "See a device wake up"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#bridge",
								className: `inline-flex h-11 items-center justify-center border border-line px-5 text-sm text-fg transition-colors duration-200 hover:border-muted active:scale-[0.96] ${focus}`,
								children: "Read the protocol"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Translator, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
					"aria-labelledby": "mile-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "mile-title",
						className: "max-w-xl text-2xl font-medium tracking-tight md:text-3xl",
						children: "The last mile is the machine."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-10 border-t border-line",
						children: miles.map(([n, line]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm text-muted",
								children: n
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg text-fg md:text-xl",
								children: line
							})]
						}, n))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "bridge",
					className: "scroll-mt-20 border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-muted uppercase",
								children: "The bridge"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 max-w-xl text-2xl font-medium tracking-tight md:text-3xl",
								children: "Haunt the bus. Name the point. Let the agent speak."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-12 grid gap-px bg-line md:grid-cols-3",
								children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "bg-bg p-6 md:p-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-xs text-signal",
											children: step.k
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-4 text-xl font-medium",
											children: step.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-relaxed text-muted",
											children: step.body
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-6 font-mono text-xs leading-relaxed text-fg",
											children: step.detail
										})
									]
								}, step.k))
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-line",
					"aria-labelledby": "bus-title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "bus-title",
								className: "text-2xl font-medium tracking-tight md:text-3xl",
								children: "What it already speaks."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-xl text-sm leading-relaxed text-muted",
								children: "Not a rip-and-replace. The buses that are still running the building, the line, and the boiler house."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-10 border-t border-line",
								children: protocols.map(([name, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "grid gap-1 border-b border-line py-4 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-baseline sm:gap-8",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-muted",
										children: note
									})]
								}, name))
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ask, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "deploy",
					className: "scroll-mt-20 border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "max-w-2xl text-2xl leading-tight font-medium tracking-tight md:text-4xl",
							children: "We don't replace the PLC. The phantom stays on your network. Only the meaning leaves."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-signal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "On-prem" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "VPC" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Air-gap" })
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-line",
					"aria-labelledby": "plant-title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-muted uppercase",
								children: "One plant"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "plant-title",
								className: "mt-4 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl",
								children: "A boiler house the last vendor told them to replace."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-xl text-sm leading-relaxed text-muted",
								children: "One hundred forty points on a serial bus. Zero APIs. Forty minutes from the first frame to a reason for the drift at shift change."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-10 grid grid-cols-2 border-t border-l border-line md:grid-cols-4",
								children: facts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-r border-b border-line p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-mono text-xs text-muted",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-2 font-mono text-3xl text-fg",
										children: value
									})]
								}, label))
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Walk, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { markClass: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted",
						children: "Registers in. Reasons out."
					})]
				})
			})
		]
	});
}
function Translator() {
	const [id, setId] = (0, import_react.useState)("boiler");
	const sample = samples.find((item) => item.id === id) ?? samples[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "translate",
		className: "scroll-mt-20 mx-auto max-w-6xl px-5 pb-20 md:pb-28",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-3",
			children: samples.map((item) => {
				const on = item.id === sample.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": on,
					onClick: () => setId(item.id),
					className: `flex h-11 items-center justify-between gap-3 border px-3 text-left text-sm transition-colors duration-200 active:scale-[0.96] ${focus} ${on ? "border-signal text-fg" : "border-line text-muted hover:border-muted"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.place }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs",
						children: item.bus
					})]
				}, item.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid border border-line bg-surface md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-muted uppercase",
							children: "Register"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "rise mt-4 font-mono text-sm leading-relaxed text-fg",
							children: sample.lines.join("\n")
						}, `${sample.id}-raw`),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-xs text-muted",
							children: sample.caption
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-0.5 bg-signal md:hidden",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden w-0.5 bg-signal md:block",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-muted uppercase",
						children: "Event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "rise mt-4 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-y-2 font-mono text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "asset"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-fg",
								children: sample.asset
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "point"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-fg",
								children: sample.point
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-fg",
								children: sample.value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "state"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: signalState(sample.state),
								children: sample.state
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "confidence"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-fg tabular-nums",
								children: sample.confidence
							})
						]
					}, `${sample.id}-event`)]
				})
			]
		})]
	});
}
function Ask() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "agents",
		className: "scroll-mt-20 border-t border-line",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-5 py-20 md:py-28",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-muted uppercase",
					children: "For agents"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl",
					children: "Why does steam pressure drift at shift change?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [
						"read_asset",
						"explain_drift",
						"subscribe_alarm"
					].map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border border-line px-3 py-2 font-mono text-xs text-fg",
						children: tool
					}, tool))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-expanded": open,
					onClick: () => setOpen((value) => !value),
					className: `mt-8 inline-flex h-11 items-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`,
					children: open ? "Hide the reason" : "Ask the plant"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl pt-6 text-base leading-relaxed text-fg",
						children: "boiler-3 discharge pressure falls 0.6 bar in the first nine minutes of second shift. The drop lines up with ahu-1 supply air opening, not with fuel rate. The register was always there. The historian never named the coincidence."
					})
				})
			]
		})
	});
}
function Walk() {
	const [sent, setSent] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	function onSubmit(event) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		if (String(data.get("device") ?? "").trim().length < 2) {
			setError("Name the device. That's the whole request.");
			return;
		}
		setError("");
		setSent(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "walk",
		className: "scroll-mt-20 border-t border-line",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-medium tracking-tight md:text-3xl",
				children: "Bring us one device nobody can query."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-sm leading-relaxed text-muted",
				children: "A register, a loop, a serial port. One is enough to start the walk. The request stays in this browser."
			})] }), sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-line bg-surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-10" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-lg text-fg",
						children: "Noted. Nothing left this browser."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "A walk starts with one device. Bring the frame when you're ready."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "grid gap-4",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-2 text-sm text-muted",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "name",
							autoComplete: "name",
							className: `h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`,
							placeholder: "Who walks the plant"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-2 text-sm text-muted",
						children: ["Site", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "site",
							className: `h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`,
							placeholder: "Boiler house, line, building"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-2 text-sm text-muted",
						children: ["The device", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "device",
							required: true,
							className: `h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`,
							placeholder: "Modbus slave 01, AI-14, AV:22"
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm text-signal",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: `inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`,
						children: "Send the device"
					})
				]
			})]
		})
	});
}
var SplitComponent = HomePage;
//#endregion
export { SplitComponent as component };
