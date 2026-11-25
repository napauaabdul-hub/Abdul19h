/* Vendas 360 — frontend SPA */
const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");
const toastRoot = document.getElementById("toast-root");

const state = {
  route: "pdv",
  categories: [],
  products: [],
  accounts: [],
  cart: { items: [], client: null, discount: 0 },
  pdv: { category: null, sub: null, q: "" },
  credito: { q: "", client: null, invoice: null },
  caixaDate: todayStr(),
  reportFrom: todayStr(),
  reportTo: todayStr(),
  stockDate: todayStr(),
};

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

const fmtMT = (v) =>
  new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0) + " MT";
const fmtQ = (v, unit) => `${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 2 }).format(v ?? 0)} ${unit || "un"}`;

function toast(msg, ok = true) {
  const el = document.createElement("div");
  el.className = "toast" + (ok ? " ok" : "");
  el.textContent = msg;
  toastRoot.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function modal(html) {
  modalRoot.innerHTML = `<div class="modal-back"><div class="modal">${html}</div></div>`;
  modalRoot.querySelector(".modal-back").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-back")) closeModal();
  });
  return modalRoot.querySelector(".modal");
}
function closeModal() { modalRoot.innerHTML = ""; }

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------------- router ---------------- */
const routes = { pdv: viewPDV, caixa: viewCaixa, credito: viewCredito, relatorios: viewRelatorios, estoque: viewEstoque, cadastros: viewCadastros };
function navigate() {
  const hash = location.hash.replace(/^#\//, "") || "pdv";
  state.route = routes[hash] ? hash : "pdv";
  document.querySelectorAll("#mainnav a").forEach((a) => a.classList.toggle("active", a.dataset.route === state.route));
  routes[state.route]();
}
window.addEventListener("hashchange", navigate);

document.getElementById("global-search").addEventListener("input", (e) => {
  state.pdv.q = e.target.value;
  if (state.route !== "pdv") location.hash = "#/pdv"; else renderProducts();
});

/* ---------------- PDV ---------------- */
async function viewPDV() {
  if (!state.categories.length) {
    const cats = await api("/api/categories");
    state.categories = cats.categories;
  }
  if (!state.accounts.length) state.accounts = await api("/api/accounts");
  if (!state.pdv.category && state.categories.length) state.pdv.category = state.categories[0];
  await loadProducts();
  app.innerHTML = `
  <div class="pdv-grid">
    <section>
      <div class="card">
        <h2>Comidas & Produtos</h2>
        <div class="cat-tabs" id="cat-tabs"></div>
        <div class="sub-chips" id="sub-chips"></div>
        <div class="prod-grid" id="prod-grid"></div>
      </div>
    </section>
    <aside class="card cart" id="cart-panel"></aside>
  </div>`;
  renderTabs(); renderProducts(); renderCart();
}

async function loadProducts() {
  const q = state.pdv.q ? `&q=${encodeURIComponent(state.pdv.q)}` : "";
  const c = state.pdv.category ? `&category=${encodeURIComponent(state.pdv.category)}` : "";
  state.products = await api(`/api/products?${q}${c}`);
}

function renderTabs() {
  const el = document.getElementById("cat-tabs");
  el.innerHTML = state.categories.map((c) => `<button class="${c === state.pdv.category ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  el.querySelectorAll("button").forEach((b) => (b.onclick = async () => {
    state.pdv.category = b.dataset.cat; state.pdv.sub = null;
    await loadProducts(); renderTabs(); renderProducts();
  }));
  const subs = [...new Set(state.products.map((p) => p.subcategory).filter(Boolean))];
  const chips = document.getElementById("sub-chips");
  if (subs.length) {
    chips.innerHTML = subs.map((s) => `<button class="${s === state.pdv.sub ? "active" : ""}" data-sub="${esc(s)}">${esc(s)}</button>`).join("");
    chips.querySelectorAll("button").forEach((b) => (b.onclick = () => { state.pdv.sub = b.dataset.sub; renderProducts(); chips.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b)); }));
  } else chips.innerHTML = "";
}

function renderProducts() {
  const grid = document.getElementById("prod-grid");
  if (!grid) return;
  let list = state.products;
  if (state.pdv.sub) list = list.filter((p) => p.subcategory === state.pdv.sub);
  grid.innerHTML = list.map((p) => `
    <button class="prod" data-id="${p.id}">
      <div class="pname">${esc(p.name)}</div>
      <div class="pstock ${p.stock <= p.min_stock ? "low" : ""}">${fmtQ(p.stock, p.unit)}${p.stock <= p.min_stock ? " — baixo!" : ""}</div>
      <div class="pprice">${fmtMT(p.price)}</div>
    </button>`).join("") || `<p class="muted">Sem produtos nesta categoria.</p>`;
  grid.querySelectorAll(".prod").forEach((b) => (b.onclick = () => addToCart(+b.dataset.id)));
}

function addToCart(pid) {
  const found = state.cart.items.find((i) => i.product.id === pid);
  if (found) found.qty += 1;
  else {
    const prod = state.products.find((x) => x.id === pid);
    if (prod) state.cart.items.push({ product: prod, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const el = document.getElementById("cart-panel");
  if (!el) return;
  const items = state.cart.items;
  const subtotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal - state.cart.discount + iva;
  el.innerHTML = `
    <h3>Caixa — a mesma venda continua <span class="badge green">${items.reduce((s, i) => s + i.qty, 0)} itens</span></h3>
    <div class="cart-items">
      ${items.map((i, idx) => `
        <div class="cart-item">
          <span class="ci-name">${esc(i.product.name)}</span>
          <span class="qty-ctl"><button data-a="dec" data-i="${idx}">−</button><b>${i.qty}</b><button data-a="inc" data-i="${idx}">+</button></span>
          <span class="mt">${fmtMT(i.qty * i.product.price)}</span>
        </div>`).join("") || `<p class="muted small">Carrinho vazio — toque num produto.</p>`}
    </div>
    <div class="cart-total">${fmtMT(total)}<small>Subtotal ${fmtMT(subtotal)} · IVA (16%) ${fmtMT(iva)} · Desc. ${fmtMT(state.cart.discount)}</small></div>
    <button class="btn ghost" id="btn-client" style="width:100%;margin-bottom:8px">👤 ${state.cart.client ? esc(state.cart.client.name) + (state.cart.client.debt ? ` (dívida ${fmtMT(state.cart.client.debt)})` : "") : "Buscar Clientes"}</button>
    <button class="btn green" id="btn-pay" style="width:100%" ${items.length ? "" : "disabled"}>💳 Finalizar Venda</button>`;
  el.querySelectorAll(".qty-ctl button").forEach((b) => (b.onclick = () => {
    const i = +b.dataset.i;
    if (b.dataset.a === "inc") state.cart.items[i].qty += 1;
    else { state.cart.items[i].qty -= 1; if (state.cart.items[i].qty <= 0) state.cart.items.splice(i, 1); }
    renderCart();
  }));
  document.getElementById("btn-client").onclick = openClientPicker;
  document.getElementById("btn-pay").onclick = () => openPayModal(total);
}

async function openClientPicker() {
  const clients = await api("/api/clients");
  const m = modal(`
    <h3>Buscar Clientes</h3>
    <input id="cl-q" placeholder="Procurar cliente..." style="width:100%;margin-bottom:10px">
    <div id="cl-list" style="max-height:300px;overflow:auto"></div>
    <div class="actions"><button class="btn ghost" onclick="closeModal()">Fechar</button></div>`);
  const render = (list) => {
    m.querySelector("#cl-list").innerHTML = list.map((c) => `
      <div class="client-row" data-id="${c.id}">
        <span><b>${esc(c.name)}</b><br><small class="muted">${esc(c.phone || "")}</small></span>
        <span class="debt">${c.debt > 0 ? fmtMT(c.debt) : "0,00 MT"}</span>
      </div>`).join("") || `<p class="muted small">Nenhum cliente.</p>`;
    m.querySelectorAll(".client-row").forEach((r) => (r.onclick = () => {
      state.cart.client = list.find((c) => c.id === +r.dataset.id);
      closeModal(); renderCart(); toast(`Cliente: ${state.cart.client.name}`);
    }));
  };
  render(clients);
  m.querySelector("#cl-q").oninput = async (e) => render(await api("/api/clients?q=" + encodeURIComponent(e.target.value)));
}

function openPayModal(total) {
  const m = modal(`
    <h3>Pagamento</h3>
    <div class="fld"><label>Total a pagar</label><div style="font-size:22px;font-weight:800">${fmtMT(total)}</div></div>
    <div class="fld"><label>Forma de pagamento / Conta destino</label>
      <div class="pay-methods" id="pm"></div></div>
    <div class="fld"><label>Valor pago (MT)</label><input id="pay-amt" type="number" step="0.01" value="${total.toFixed(2)}"></div>
    <div class="fld" id="fiado-note" style="display:none"><label>O restante vai para fiado do cliente</label></div>
    <div class="actions">
      <button class="btn ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn green" id="confirm-pay">Confirmar Venda</button>
    </div>`);
  const methods = [...state.accounts.map((a) => ({ id: a.id, label: `${icon(a.kind)} ${a.name}${a.detail ? " (" + esc(a.detail) + ")" : ""}`, fiado: false })),
    { id: 0, label: "📒 Fiado (cliente)", fiado: true }];
  const pm = m.querySelector("#pm");
  let sel = methods[0];
  const paint = () => {
    pm.innerHTML = methods.map((x) => `<button class="${x.id === sel.id ? "active" : ""}" data-id="${x.id}">${x.label}</button>`).join("");
    pm.querySelectorAll("button").forEach((b) => (b.onclick = () => { sel = methods.find((x) => x.id === +b.dataset.id); paint(); }));
    m.querySelector("#fiado-note").style.display = sel.fiado ? "block" : "none";
  };
  paint();
  m.querySelector("#confirm-pay").onclick = async () => {
    const amt = parseFloat(m.querySelector("#pay-amt").value || "0");
    const payments = [];
    if (sel.fiado) {
      if (!state.cart.client) return toast("Fiado exige um cliente selecionado", false);
      if (amt > 0) payments.push({ account_id: state.accounts[0].id, amount: amt });
    } else {
      if (amt <= 0) return toast("Informe o valor pago", false);
      payments.push({ account_id: sel.id, amount: amt });
    }
    try {
      const r = await api("/api/sales", { method: "POST", body: { items: state.cart.items.map((i) => ({ product_id: i.product.id, qty: i.qty })), discount: state.cart.discount, client_id: state.cart.client?.id || null, payments } });
      closeModal();
      state.cart = { items: [], client: null, discount: 0 };
      await loadProducts(); renderProducts(); renderCart();
      showReceipt(r);
    } catch (e) { toast(e.message, false); }
  };
}
function icon(kind) { return { dinheiro: "💵", mpesa: "📱", emola: "🟠", pos: "💳", banco: "🏦", outros: "🧾" }[kind] || "💰"; }

function showReceipt(r) {
  modal(`
    <div class="receipt">
      <h3>VENDAS 360</h3>
      <div class="rline"><span>Venda</span><b>#${r.number}</b></div>
      <div class="rline"><span>Status</span><b>${r.fiado > 0 ? "PARCIAL (fiado " + fmtMT(r.fiado) + ")" : "CONCLUÍDO"}</b></div>
      <div class="rdiv"></div>
      ${state.cart.items.length ? "" : ""}
      <div class="rline"><span>Total</span><b>${fmtMT(r.total)}</b></div>
      <div class="rline"><span>Pago</span><b>${fmtMT(r.pago)}</b></div>
      ${r.fiado > 0 ? `<div class="rline"><span>Fiado (fatura #${r.invoice?.number})</span><b>${fmtMT(r.fiado)}</b></div>` : ""}
      <div class="rdiv"></div>
      <p style="text-align:center">Obrigado pela preferência!</p>
    </div>
    <div class="actions">
      <button class="btn ghost" onclick="window.print()">🖨️ Imprimir</button>
      <button class="btn green" onclick="closeModal()">Nova venda</button>
    </div>`);
  toast(`Venda #${r.number} registada — ${fmtMT(r.total)}`);
}

/* ---------------- Caixa ---------------- */
async function viewCaixa() {
  state.caixaDate = state.caixaDate || todayStr();
  const s = await api(`/api/cash/summary?date=${state.caixaDate}`);
  state.accounts = s.accounts;
  app.innerHTML = `
  <h2>Gestão de Caixa</h2>
  <div style="margin:10px 0"><input type="date" id="cx-date" value="${s.date}"></div>
  <div class="caixa-actions">
    <button class="btn green" id="b-in">＋ NOVA ENTRADA</button>
    <button class="btn red" id="b-out">－ NOVA SAÍDA</button>
    <button class="btn blue" id="b-re">↩ QUEBRA / REEMBOLSO</button>
  </div>
  <div class="row">
    <div class="card grow">
      <h3>Resumo de Desempenho Diário</h3>
      <div class="kpi-row" style="margin-top:10px">
        <div class="stat"><div class="lbl">Entradas</div><div class="val" style="color:var(--green)">${fmtMT(s.resumo.ENTRADA.total)}</div><small class="muted">${s.resumo.ENTRADA.n} Transações</small></div>
        <div class="stat"><div class="lbl">Reembolso</div><div class="val" style="color:var(--blue)">${fmtMT(s.resumo.REEMBOLSO.total)}</div><small class="muted">${s.resumo.REEMBOLSO.n} Movimentos</small></div>
        <div class="stat"><div class="lbl">Saídas</div><div class="val" style="color:var(--red)">${fmtMT(s.resumo.SAIDA.total)}</div><small class="muted">${s.resumo.SAIDA.n} Movimentos</small></div>
      </div>
      <div class="caixa-bottom">
        <button class="btn green" id="b-divida">Pagamento Dívida</button>
        <button class="btn red" id="b-anular">Anular Movimento</button>
      </div>
      <h3>Histórico de Movimentos</h3>
      <div style="max-height:300px;overflow:auto;margin-top:8px">
      <table class="data"><thead><tr><th>HORA</th><th>TIPO</th><th>CONTA</th><th>DESCRIÇÃO</th><th style="text-align:right">VALOR</th><th></th></tr></thead>
      <tbody>${s.historico.map((h) => `
        <tr ${h.cancelled ? 'style="opacity:.4;text-decoration:line-through"' : ""}>
          <td>${esc(h.created_at_fmt.slice(11))}</td>
          <td><span class="badge ${h.type === "ENTRADA" || h.type === "PAGAMENTO_DIVIDA" ? "green" : h.type === "SAIDA" ? "red" : h.type === "REEMBOLSO" ? "amber" : "gray"}">${h.type.replace("_", " ")}</span></td>
          <td>${esc(h.account_name)}</td><td>${esc(h.description || "")}</td>
          <td class="mt" style="text-align:right">${h.type === "SAIDA" || h.type === "REEMBOLSO" ? "−" : "+"}${fmtMT(h.amount)}</td>
          <td>${h.cancelled ? '<span class="badge gray">anulado</span>' : `<button class="btn red small" style="padding:3px 8px;font-size:11px" data-cancel="${h.id}">anular</button>`}</td>
        </tr>`).join("") || `<tr><td colspan="6" class="muted">Sem movimentos neste dia.</td></tr>`}</tbody></table>
      </div>
    </div>
    <div class="card" style="width:320px">
      <h3>Saldo das Contas de Pagamento</h3>
      <div style="margin-top:8px">
        ${s.accounts.map((a) => `<div class="account-bal"><span>${icon(a.kind)} ${esc(a.name)}${a.detail ? ` <small class="muted">(${esc(a.detail)})</small>` : ""}</span><b class="mt">${fmtMT(a.balance)}</b></div>`).join("")}
        <div class="account-bal total"><span>TOTAL GERAL</span><span class="mt">${fmtMT(s.total_geral)}</span></div>
      </div>
    </div>
  </div>`;
  document.getElementById("cx-date").onchange = (e) => { state.caixaDate = e.target.value; viewCaixa(); };
  document.getElementById("b-in").onclick = () => cashModal("ENTRADA", "Nova Entrada");
  document.getElementById("b-out").onclick = () => cashModal("SAIDA", "Nova Saída");
  document.getElementById("b-re").onclick = () => cashModal("REEMBOLSO", "Quebra / Reembolso");
  document.getElementById("b-divida").onclick = () => (location.hash = "#/credito");
  document.getElementById("b-anular").onclick = () => toast("Selecione “anular” numa linha do histórico");
  app.querySelectorAll("[data-cancel]").forEach((b) => (b.onclick = async () => {
    try { await api(`/api/cash/movements/${b.dataset.cancel}/cancel`, { method: "POST", body: {} }); toast("Movimento anulado"); viewCaixa(); }
    catch (e) { toast(e.message, false); }
  }));
}

function cashModal(type, title) {
  const m = modal(`
    <h3>${title}</h3>
    <div class="fld"><label>Conta</label><select id="cm-acc">${state.accounts.map((a) => `<option value="${a.id}">${esc(a.name)}${a.detail ? " (" + esc(a.detail) + ")" : ""}</option>`).join("")}</select></div>
    <div class="fld"><label>Valor (MT)</label><input id="cm-amt" type="number" step="0.01" min="0.01" placeholder="0,00"></div>
    <div class="fld"><label>Descrição</label><input id="cm-desc" placeholder="Motivo..."></div>
    <div class="actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn ${type === "ENTRADA" ? "green" : type === "SAIDA" ? "red" : "blue"}" id="cm-ok">Confirmar</button></div>`);
  m.querySelector("#cm-ok").onclick = async () => {
    try {
      await api("/api/cash/movements", { method: "POST", body: { type, account_id: +m.querySelector("#cm-acc").value, amount: parseFloat(m.querySelector("#cm-amt").value || "0"), description: m.querySelector("#cm-desc").value } });
      closeModal(); toast(`${title} registado`); viewCaixa();
    } catch (e) { toast(e.message, false); }
  };
}

/* ---------------- Crédito ---------------- */
async function viewCredito() {
  const q = state.credito.q ? `?q=${encodeURIComponent(state.credito.q)}` : "";
  const sum = await api("/api/credit/summary");
  const clients = await api("/api/clients" + (state.credito.q ? q : ""));
  app.innerHTML = `
  <h2>Gestão de Crédito</h2>
  <div class="credito-grid" style="margin-top:10px">
    <div class="card">
      <input id="cr-q" placeholder="Procurar cliente..." value="${esc(state.credito.q)}" style="width:100%;margin-bottom:10px">
      <div id="cr-list">
        ${sum.clients.map((c) => `
          <div class="client-row ${state.credito.client?.id === c.id ? "active" : ""}" data-id="${c.id}">
            <span><b>${esc(c.name)}</b></span><span class="debt">${fmtMT(c.debt)}</span>
          </div>`).join("") || `<p class="muted small">Sem clientes com dívida.</p>`}
      </div>
      <div style="margin-top:12px;padding-top:10px;border-top:2px solid var(--line)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <small class="muted" style="text-transform:uppercase;letter-spacing:.5px">Dívida total acumulada</small>
          <b style="color:var(--red)">${fmtMT(sum.total_debt)}</b>
        </div>
        <button class="btn green" id="liq-tudo" style="width:100%;margin-top:8px">Liquidar Tudo</button>
      </div>
    </div>
    <div id="cr-detail"><p class="muted">Selecione um cliente para ver as faturas.</p></div>
  </div>`;
  document.getElementById("cr-q").oninput = (e) => { state.credito.q = e.target.value; viewCredito(); };
  app.querySelectorAll("#cr-list .client-row").forEach((r) => (r.onclick = async () => {
    state.credito.client = sum.clients.find((c) => c.id === +r.dataset.id) || clients.find((c) => c.id === +r.dataset.id);
    viewCredito();
  }));
  document.getElementById("liq-tudo").onclick = () => liquidarTudo(sum.clients);
  if (state.credito.client) renderCreditoDetail();
}

async function renderCreditoDetail() {
  const el = document.getElementById("cr-detail");
  if (!el) return;
  const cid = state.credito.client.id;
  const invs = await api(`/api/invoices?client_id=${cid}`);
  if (!state.credito.invoice && invs.length) state.credito.invoice = invs[0].id;
  let inv = null;
  if (state.credito.invoice) inv = await api(`/api/invoices/${state.credito.invoice}`).catch(() => null);
  el.innerHTML = `
    <div class="card" style="margin-bottom:12px">
      <h3>${esc(state.credito.client.name)} ${state.credito.client.debt > 0 ? `<span class="badge red">dívida ${fmtMT(state.credito.client.debt)}</span>` : '<span class="badge green">sem dívida</span>'}</h3>
      <div id="inv-list" style="margin-top:10px">
        ${invs.map((i) => `
          <div class="inv-row ${i.id === state.credito.invoice ? "active" : ""}" data-id="${i.id}">
            <span><b>#${i.number}</b> <span class="badge ${i.status === "PARCIAL" ? "amber" : i.status === "LIQUIDADA" ? "green" : "red"}">${i.status}</span><br>
            <small class="muted">${esc(i.created_at_fmt)} · saldo devedor <b>${fmtMT(i.saldo)}</b></small></span>
            <button class="btn ghost small" style="padding:5px 10px">Selecionar</button>
          </div>`).join("") || `<p class="muted small">Sem faturas em aberto.</p>`}
      </div>
    </div>
    ${inv ? `
    <div class="card">
      <h3>Fatura #${inv.number} <span class="badge ${inv.status === "PARCIAL" ? "amber" : inv.status === "LIQUIDADA" ? "green" : "red"}">${inv.status}</span></h3>
      <div class="kpi-row" style="margin-top:10px">
        <div class="stat"><div class="lbl">Saldo devedor</div><div class="val" style="color:var(--red)">${fmtMT(inv.saldo)}</div></div>
        <div class="stat"><div class="lbl">Data</div><div class="val" style="font-size:14px">${esc(inv.created_at_fmt)}</div></div>
        <div class="stat"><div class="lbl">Valor original</div><div class="val">${fmtMT(inv.original)}</div></div>
        <div class="stat"><div class="lbl">Já pago</div><div class="val" style="color:var(--green)">${fmtMT(inv.paid)}</div></div>
        <div class="stat"><div class="lbl">Produtos</div><div class="val">${inv.n_items}</div></div>
      </div>
      ${inv.items.length ? `<table class="data"><thead><tr><th>PRODUTO</th><th>QTD</th><th style="text-align:right">PREÇO</th><th style="text-align:right">TOTAL</th></tr></thead>
      <tbody>${inv.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td class="mt" style="text-align:right">${fmtMT(i.price)}</td><td class="mt" style="text-align:right">${fmtMT(i.qty * i.price)}</td></tr>`).join("")}</tbody></table>` : ""}
      ${inv.status !== "LIQUIDADA" ? `
      <div class="row" style="margin-top:12px;align-items:flex-end">
        <div class="fld grow"><label>Liquidar Fatura — Valor a pagar (MT)</label><input id="lq-amt" type="number" step="0.01" min="0.01" max="${inv.saldo}" value="${inv.saldo.toFixed(2)}"></div>
        <div class="fld grow"><label>Conta destino</label><select id="lq-acc">${state.accounts.map((a) => `<option value="${a.id}">${icon(a.kind)} ${esc(a.name)}</option>`).join("")}</select></div>
        <button class="btn green" id="lq-ok">Confirmar Pagamento</button>
      </div>` : `<p class="muted" style="margin-top:10px">Fatura liquidada. ✅</p>`}
    </div>` : ""}`;
  el.querySelectorAll("#inv-list .inv-row").forEach((r) => (r.onclick = () => { state.credito.invoice = +r.dataset.id; renderCreditoDetail(); }));
  const ok = el.querySelector("#lq-ok");
  if (ok) ok.onclick = async () => {
    try {
      const r = await api(`/api/invoices/${inv.id}/payments`, { method: "POST", body: { amount: parseFloat(el.querySelector("#lq-amt").value || "0"), account_id: +el.querySelector("#lq-acc").value } });
      toast(`Pagamento confirmado — ${state.credito.client.name} · ${fmtMT(r.pago)} — Fatura #${r.number} ${r.status === "LIQUIDADA" ? "liquidada" : "parcial"}`);
      state.credito.invoice = null;
      viewCredito();
      if (state.route === "caixa") viewCaixa();
    } catch (e) { toast(e.message, false); }
  };
}

function liquidarTudo(clients) {
  const m = modal(`
    <h3>Liquidar Tudo</h3>
    <div class="fld"><label>Cliente</label><select id="lt-cl">${clients.map((c) => `<option value="${c.id}">${esc(c.name)} — ${fmtMT(c.debt)}</option>`).join("")}</select></div>
    <div class="fld"><label>Conta destino</label><select id="lt-acc">${state.accounts.map((a) => `<option value="${a.id}">${icon(a.kind)} ${esc(a.name)}</option>`).join("")}</select></div>
    <div class="actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn green" id="lt-ok">Confirmar Pagamento</button></div>`);
  m.querySelector("#lt-ok").onclick = async () => {
    try {
      const r = await api(`/api/clients/${m.querySelector("#lt-cl").value}/pay-all`, { method: "POST", body: { account_id: +m.querySelector("#lt-acc").value } });
      closeModal(); toast(`Pagamento confirmado — ${fmtMT(r.pago)} em ${r.faturas} fatura(s) liquidada(s)`);
      viewCredito();
    } catch (e) { toast(e.message, false); }
  };
}

/* ---------------- Relatórios ---------------- */
async function viewRelatorios() {
  app.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
    <h2>Relatórios</h2>
    <div>
      <input type="date" id="rp-from" value="${state.reportFrom}"> <input type="date" id="rp-to" value="${state.reportTo}">
      <button class="btn ghost" id="rp-csv">CSV</button>
      <button class="btn ghost" id="rp-pdf">PDF</button>
    </div>
  </div>
  <div class="tabs" style="margin-top:12px">
    <button class="active" data-tab="extrato">Extrato de Vendas</button>
    <button data-tab="itens">Itens Vendidos</button>
  </div>
  <div id="rp-body"></div>`;
  document.getElementById("rp-from").onchange = (e) => { state.reportFrom = e.target.value; renderReport(); };
  document.getElementById("rp-to").onchange = (e) => { state.reportTo = e.target.value; renderReport(); };
  document.getElementById("rp-csv").onclick = async () => {
    const r = await api(`/api/reports/export?from=${state.reportFrom}&to=${state.reportTo}`);
    const blob = new Blob(["﻿" + r.csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `extrato_vendas_${state.reportFrom}_a_${state.reportTo}.csv`;
    a.click();
    toast("CSV exportado");
  };
  document.getElementById("rp-pdf").onclick = () => window.print();
  app.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => {
    app.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("active", x === b));
    state.reportTab = b.dataset.tab; renderReport();
  }));
  state.reportTab = state.reportTab || "extrato";
  await renderReport();
}

async function renderReport() {
  const el = document.getElementById("rp-body");
  if (!el) return;
  if (state.reportTab === "extrato") {
    const r = await api(`/api/reports/sales?from=${state.reportFrom}&to=${state.reportTo}`);
    el.innerHTML = `
      <div class="kpi-row">
        <div class="stat"><div class="lbl">Subtotal</div><div class="val">${fmtMT(r.subtotal)}</div></div>
        <div class="stat"><div class="lbl">Descontos</div><div class="val">${fmtMT(r.descontos)}</div></div>
        <div class="stat"><div class="lbl">Total IVA (16%)</div><div class="val">${fmtMT(r.iva)}</div></div>
        <div class="stat"><div class="lbl">Total Geral</div><div class="val" style="color:var(--green-d)">${fmtMT(r.total)}</div></div>
        <div class="stat"><div class="lbl">Lucro Real</div><div class="val" style="color:var(--blue)">${fmtMT(r.lucro_real)}</div></div>
        <div class="stat"><div class="lbl">Ticket Médio</div><div class="val">${fmtMT(r.ticket_medio)}</div><small class="muted">${r.n_vendas} vendas</small></div>
      </div>
      <div class="card">
        <table class="data"><thead><tr><th>ID / DATA</th><th>CLIENTE</th><th style="text-align:right">TOTAL</th><th style="text-align:right">LUCRO</th><th>STATUS</th></tr></thead>
        <tbody>${r.vendas.map((v) => `
          <tr><td>#${v.number}<br><small class="muted">${esc(v.created_at_fmt)}</small></td>
          <td>${esc(v.client_name || "Consumidor Final")}</td>
          <td class="mt" style="text-align:right">${fmtMT(v.total)}</td>
          <td class="mt" style="text-align:right">${fmtMT(v.lucro)}</td>
          <td><span class="badge ${v.status === "CONCLUIDO" ? "green" : "amber"}">${v.status}</span></td></tr>`).join("") || `<tr><td colspan="5" class="muted">Sem vendas no período.</td></tr>`}</tbody></table>
      </div>`;
  } else {
    const items = await api(`/api/reports/items?from=${state.reportFrom}&to=${state.reportTo}`);
    el.innerHTML = `
      <div class="card">
        <h3>Itens vendidos no período</h3>
        <table class="data" style="margin-top:8px"><thead><tr><th>PRODUTO</th><th>CATEGORIA</th><th>QTD</th><th style="text-align:right">TOTAL</th><th style="text-align:right">LUCRO</th></tr></thead>
        <tbody>${items.map((i) => `<tr><td>${esc(i.name)}</td><td>${esc(i.category || "")}</td><td>${i.qty}</td><td class="mt" style="text-align:right">${fmtMT(i.total)}</td><td class="mt" style="text-align:right">${fmtMT(i.lucro)}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Sem itens no período.</td></tr>`}</tbody></table>
      </div>`;
  }
}

/* ---------------- Estoque ---------------- */
async function viewEstoque() {
  const r = await api(`/api/stock/position?date=${state.stockDate}`);
  app.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
    <h2>Posição de Estoque</h2>
    <div><input type="date" id="st-date" value="${r.date}"> <button class="btn green" id="st-in">＋ Entrada de Mercadoria</button></div>
  </div>
  <div class="card" style="margin-top:12px;overflow:auto">
    <table class="data"><thead><tr><th>PRODUTO</th><th>CATEGORIA</th><th>ABERTURA</th><th>ENTRADAS</th><th>SAÍDAS</th><th>FECHO</th><th></th></tr></thead>
    <tbody>${r.items.map((p) => `
      <tr ${p.fecho <= p.min_stock ? 'style="background:#fef2f2"' : ""}>
        <td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td>
        <td class="mt">${fmtQ(p.abertura, p.unit)}</td>
        <td class="mt" style="color:var(--green)">+${fmtQ(p.entradas, p.unit)}</td>
        <td class="mt" style="color:var(--red)">${fmtQ(p.saidas, p.unit)}</td>
        <td class="mt"><b>${fmtQ(p.fecho, p.unit)}</b></td>
        <td>${p.fecho <= p.min_stock ? '<span class="badge red">ruptura</span>' : ""}</td>
      </tr>`).join("")}</tbody></table>
  </div>`;
  document.getElementById("st-date").onchange = (e) => { state.stockDate = e.target.value; viewEstoque(); };
  document.getElementById("st-in").onclick = async () => {
    const prods = await api("/api/products");
    const m = modal(`
      <h3>Nova Entrada de Mercadoria</h3>
      <div class="fld"><label>Produto</label><select id="en-p">${prods.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
      <div class="fld"><label>Quantidade</label><input id="en-q" type="number" step="0.01" min="0.01" value="1"></div>
      <div class="fld"><label>Nota</label><input id="en-n" value="Entrada de mercadoria"></div>
      <div class="actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn green" id="en-ok">Confirmar</button></div>`);
    m.querySelector("#en-ok").onclick = async () => {
      try {
        await api("/api/stock/entries", { method: "POST", body: { product_id: +m.querySelector("#en-p").value, qty: parseFloat(m.querySelector("#en-q").value || "0"), note: m.querySelector("#en-n").value } });
        closeModal(); toast("Entrada registada"); viewEstoque();
      } catch (e) { toast(e.message, false); }
    };
  };
}

/* ---------------- Cadastros ---------------- */
async function viewCadastros() {
  const [prods, clients, accounts] = await Promise.all([api("/api/products"), api("/api/clients"), api("/api/accounts")]);
  state.accounts = accounts;
  app.innerHTML = `
  <div class="row" style="align-items:flex-start">
    <div class="card grow">
      <div style="display:flex;justify-content:space-between;align-items:center"><h2>Produtos</h2><button class="btn green" id="np">＋ Novo Produto</button></div>
      <div style="max-height:420px;overflow:auto;margin-top:8px">
      <table class="data"><thead><tr><th>CÓD</th><th>NOME</th><th>CATEGORIA</th><th>UN</th><th style="text-align:right">PREÇO</th><th style="text-align:right">CUSTO</th><th style="text-align:right">STOCK</th></tr></thead>
      <tbody>${prods.map((p) => `<tr><td>${esc(p.code || "")}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${esc(p.unit)}</td><td class="mt" style="text-align:right">${fmtMT(p.price)}</td><td class="mt" style="text-align:right">${fmtMT(p.cost)}</td><td class="mt" style="text-align:right">${fmtQ(p.stock, p.unit)}</td></tr>`).join("")}</tbody></table>
      </div>
    </div>
    <div style="width:320px;display:flex;flex-direction:column;gap:12px">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3>Clientes</h3><button class="btn green small" id="nc" style="padding:6px 10px">＋ Novo</button></div>
        <div style="max-height:240px;overflow:auto;margin-top:8px">
        ${clients.map((c) => `<div class="account-bal"><span>${esc(c.name)}</span><b class="${c.debt > 0 ? "mt" : ""}" style="color:${c.debt > 0 ? "var(--red)" : "inherit"}">${c.debt > 0 ? fmtMT(c.debt) : "—"}</b></div>`).join("")}
        </div>
      </div>
      <div class="card">
        <h3>Contas de Pagamento</h3>
        <div style="margin-top:8px">${accounts.map((a) => `<div class="account-bal"><span>${icon(a.kind)} ${esc(a.name)}${a.detail ? ` <small class="muted">(${esc(a.detail)})</small>` : ""}</span></div>`).join("")}</div>
      </div>
    </div>
  </div>`;
  document.getElementById("np").onclick = () => productModal();
  document.getElementById("nc").onclick = () => {
    const m = modal(`
      <h3>Novo Cliente</h3>
      <div class="fld"><label>Nome</label><input id="nc-n"></div>
      <div class="fld"><label>Telefone</label><input id="nc-p"></div>
      <div class="actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn green" id="nc-ok">Guardar</button></div>`);
    m.querySelector("#nc-ok").onclick = async () => {
      try {
        await api("/api/clients", { method: "POST", body: { name: m.querySelector("#nc-n").value, phone: m.querySelector("#nc-p").value } });
        closeModal(); toast("Cliente criado"); viewCadastros();
      } catch (e) { toast(e.message, false); }
    };
  };
}

function productModal() {
  const cats = state.categories.length ? state.categories : ["Mercearia", "Bar", "Restaurante", "Padaria", "Talho & Peixaria"];
  const m = modal(`
    <h3>Novo Produto</h3>
    <div class="fld"><label>Nome</label><input id="pp-n"></div>
    <div class="row"><div class="fld grow"><label>Categoria</label><select id="pp-c">${cats.map((c) => `<option>${esc(c)}</option>`).join("")}</select></div>
    <div class="fld grow"><label>Subcategoria</label><input id="pp-s"></div></div>
    <div class="row"><div class="fld grow"><label>Unidade</label><input id="pp-u" value="un"></div>
    <div class="fld grow"><label>Preço (MT)</label><input id="pp-p" type="number" step="0.01"></div></div>
    <div class="row"><div class="fld grow"><label>Custo (MT)</label><input id="pp-cost" type="number" step="0.01"></div>
    <div class="fld grow"><label>Stock inicial</label><input id="pp-st" type="number" step="0.01" value="0"></div></div>
    <div class="actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn green" id="pp-ok">Guardar</button></div>`);
  m.querySelector("#pp-ok").onclick = async () => {
    try {
      await api("/api/products", { method: "POST", body: {
        name: m.querySelector("#pp-n").value, category: m.querySelector("#pp-c").value, subcategory: m.querySelector("#pp-s").value,
        unit: m.querySelector("#pp-u").value, price: parseFloat(m.querySelector("#pp-p").value || "0"),
        cost: parseFloat(m.querySelector("#pp-cost").value || "0"), stock: parseFloat(m.querySelector("#pp-st").value || "0") } });
      closeModal(); toast("Produto criado"); viewCadastros(); if (state.route === "pdv") viewPDV();
    } catch (e) { toast(e.message, false); }
  };
}

/* ---------------- boot ---------------- */
(async () => {
  try {
    const boot = await api("/api/boot");
    document.getElementById("user-name").textContent = boot.user.name;
    document.getElementById("user-role").textContent = boot.user.role;
  } catch (e) { /* api indisponivel */ }
  navigate();
})();
