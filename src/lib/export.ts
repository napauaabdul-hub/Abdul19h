import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { Budget, CalcResult, SavedProject } from './types';
import { formatMT, formatNumber } from './format';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resumoLinhas(resultado: CalcResult, orcamento: Budget | null): string {
  const linhas = resultado.resumo
    .map((item) => {
      const linha = orcamento?.linhas.find((l) => l.material === item.material && l.unidade === item.unidade);
      const preco = linha ? formatMT(linha.total) : '—';
      return `${item.material}: ${formatNumber(item.quantidade)} ${item.unidade} (${preco})`;
    })
    .join('\n');
  const total = orcamento ? `\nTotal estimado: ${formatMT(orcamento.total)}` : '';
  return linhas + total;
}

export function buildCsv(project: SavedProject): string {
  const { resultado, orcamento } = project;
  const linhas: string[] = [];
  linhas.push(`Projeto,${escapeCsv(project.nome)}`);
  linhas.push(`Data,${new Date(project.criadoEm).toLocaleDateString('pt-MZ')}`);
  linhas.push(`Área,${formatNumber(resultado.area)} m2`);
  linhas.push('');
  linhas.push('Etapa,Material,Quantidade,Unidade,Desperdício,Observações,Preço unit. (MT),Total (MT)');
  for (const etapa of resultado.etapas) {
    for (const item of etapa.itens) {
      const linha = orcamento?.linhas.find((l) => l.material === item.material && l.unidade === item.unidade);
      linhas.push(
        [
          etapa.titulo,
          item.material,
          formatNumber(item.quantidade).replace('.', ','),
          item.unidade,
          `${Math.round(item.desperdicio * 100)}%`,
          item.observacao,
          linha ? String(linha.precoUnit).replace('.', ',') : '',
          linha ? String(linha.total).replace('.', ',') : '',
        ]
          .map(escapeCsv)
          .join(','),
      );
    }
  }
  if (orcamento) {
    linhas.push('');
    linhas.push(`Transporte,${String(orcamento.transporte).replace('.', ',')}`);
    linhas.push(`Total estimado,${String(orcamento.total).replace('.', ',')}`);
  }
  return linhas.join('\n');
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildPdfHtml(project: SavedProject): string {
  const { input, resultado, orcamento } = project;
  const rows = resultado.etapas
    .map((etapa) => {
      const itens = etapa.itens
        .map((item) => {
          const linha = orcamento?.linhas.find((l) => l.material === item.material && l.unidade === item.unidade);
          return `<tr>
            <td>${escapeHtml(item.material)}</td>
            <td class="n">${formatNumber(item.quantidade)}</td>
            <td>${escapeHtml(item.unidade)}</td>
            <td class="n">${Math.round(item.desperdicio * 100)}%</td>
            <td>${escapeHtml(item.observacao)}</td>
            <td class="n">${linha ? formatMT(linha.total) : '—'}</td>
          </tr>`;
        })
        .join('');
      return `<h3>${escapeHtml(etapa.titulo)}</h3>
      <p class="desc">${escapeHtml(etapa.descricao)}</p>
      <table><thead><tr><th>Material</th><th>Qtd.</th><th>Un.</th><th>Desp.</th><th>Observações</th><th>Total</th></tr></thead>
      <tbody>${itens}</tbody></table>`;
    })
    .join('');
  const total = orcamento
    ? `<div class="total">Transporte: ${formatMT(orcamento.transporte)}<br/>Total estimado: ${formatMT(orcamento.total)}</div>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    body{font-family:Helvetica,Arial,sans-serif;color:#202124;font-size:12px;margin:24px}
    h1{color:#07566A;font-size:20px;margin-bottom:4px}
    h3{color:#07566A;font-size:14px;margin:18px 0 4px}
    .desc{color:#5f6368;margin:0 0 8px}
    table{width:100%;border-collapse:collapse;margin-bottom:8px}
    th{background:#07566A;color:#fff;text-align:left;padding:6px;font-size:11px}
    td{border-bottom:1px solid #E3E6E4;padding:6px;font-size:11px;vertical-align:top}
    td.n{text-align:right;white-space:nowrap}
    .meta{color:#5f6368;font-size:11px;margin-bottom:12px}
    .total{margin-top:16px;font-size:14px;font-weight:bold;color:#F47721}
    .aviso{margin-top:24px;font-size:10px;color:#5f6368;border-top:1px solid #E3E6E4;padding-top:8px}
  </style></head><body>
    <h1>NAPAUA BUILD — ${escapeHtml(project.nome)}</h1>
    <div class="meta">Emitido em ${new Date(project.criadoEm).toLocaleDateString('pt-MZ')} ·
      Tipo ${escapeHtml(input.tipo)} · ${formatNumber(resultado.area)} m² · ${input.pisos} piso(s)</div>
    ${rows}
    ${total}
    <div class="aviso">Estimativa de planeamento gerada por fórmulas verificáveis. Não substitui o dimensionamento de profissionais habilitados.</div>
  </body></html>`;
}

export async function exportarCsv(project: SavedProject): Promise<string | null> {
  const conteudo = buildCsv(project);
  const file = new FileSystem.File(FileSystem.Paths.document, `${project.id}-materiais.csv`);
  await file.write('﻿' + conteudo);
  return file.uri;
}

export async function exportarPdf(project: SavedProject): Promise<string | null> {
  const { uri } = await Print.printToFileAsync({ html: buildPdfHtml(project) });
  return uri;
}

export async function partilharArquivo(uri: string, titulo: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: uri.endsWith('.pdf') ? 'application/pdf' : 'text/csv', dialogTitle: titulo, UTI: uri.endsWith('.pdf') ? 'com.adobe.pdf' : 'public.comma-separated-values-text' });
  }
}

export async function partilharWhatsApp(project: SavedProject): Promise<void> {
  const texto =
    `*NAPAUA BUILD — ${project.nome}*\n` +
    `Área: ${formatNumber(project.resultado.area)} m²\n\n` +
    resumoLinhas(project.resultado, project.orcamento) +
    `\n\n_Estimativa de planeamento — NAPAUA BUILD_`;
  const url = `whatsapp://send?text=${encodeURIComponent(texto)}`;
  const suportado = await Linking.canOpenURL(url);
  if (suportado) {
    await Linking.openURL(url);
  } else if (Platform.OS === 'web') {
    await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(texto)}`);
  } else {
    await Linking.openURL(`sms:?body=${encodeURIComponent(texto)}`);
  }
}
