// utils/messageFormatter.ts
import { extractComplexityBadge, extractRiskBadge } from './formatUtils';

export const formatList = (content: string): string => {
  if (!content) return '';
  
  // Clean and format the content
  return content.split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .filter(item => {
      // Filter out markdown headers and empty labels
      return !item.match(/^#+\s*/) && !item.match(/^\s*-?\s*\w+:\s*$/);
    })
    .map(item => {
      // Clean up the item - remove markdown formatting
      let formattedItem = item
        .replace(/^-\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **bold** to HTML
        .replace(/^#+\s*/, ''); // Remove any remaining headers
      
      // Parse key-value pairs for better formatting
      const colonIndex = formattedItem.indexOf(':');
      if (colonIndex > 0 && colonIndex < formattedItem.length - 1) {
        const key = formattedItem.substring(0, colonIndex).trim();
        const value = formattedItem.substring(colonIndex + 1).trim();
        
        // Add appropriate icons and styling based on content
        let icon = '📋';
        let colorClass = 'bg-gray-50 border-gray-200';
        
        if (key.toLowerCase().includes('type')) {
          icon = '🏷️';
          colorClass = 'bg-blue-50 border-blue-200';
        } else if (key.toLowerCase().includes('efficiency') || key.toLowerCase().includes('performance')) {
          icon = '⚡';
          colorClass = 'bg-emerald-50 border-emerald-200';
        } else if (key.toLowerCase().includes('risk') || key.toLowerCase().includes('security')) {
          icon = '🛡️';
          colorClass = value.toLowerCase().includes('low') ? 'bg-emerald-50 border-emerald-200' : 
                       value.toLowerCase().includes('medium') ? 'bg-yellow-50 border-yellow-200' : 
                       'bg-red-50 border-red-200';
        } else if (key.toLowerCase().includes('gas') || key.toLowerCase().includes('cost')) {
          icon = '⛽';
          colorClass = 'bg-orange-50 border-orange-200';
        } else if (key.toLowerCase().includes('recommendation')) {
          icon = '💡';
          colorClass = 'bg-purple-50 border-purple-200';
        } else if (key.toLowerCase().includes('network') || key.toLowerCase().includes('congestion')) {
          icon = '🌐';
          colorClass = 'bg-teal-50 border-teal-200';
        } else if (key.toLowerCase().includes('time') || key.toLowerCase().includes('block')) {
          icon = '⏱️';
          colorClass = 'bg-indigo-50 border-indigo-200';
        }
        
        return `
          <div class="${colorClass} border rounded-xl p-4 my-2 hover:shadow-md transition-all duration-300">
            <div class="flex items-start gap-3">
              <span class="text-lg flex-shrink-0 mt-0.5">${icon}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-600 mb-1">${key}</div>
                <div class="text-gray-900 font-medium">${value}</div>
              </div>
            </div>
          </div>
        `;
      }
      
      // Handle general content
      if (formattedItem.toLowerCase().includes('warning') || formattedItem.toLowerCase().includes('risk')) {
        return `
          <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl my-2 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-3">
              <span class="text-red-500 text-lg flex-shrink-0">⚠️</span>
              <div class="flex-1">${formattedItem}</div>
            </div>
          </div>
        `;
      }
      if (formattedItem.toLowerCase().includes('success') || formattedItem.toLowerCase().includes('good') || formattedItem.toLowerCase().includes('efficient')) {
        return `
          <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl my-2 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-3">
              <span class="text-emerald-500 text-lg flex-shrink-0">✅</span>
              <div class="flex-1">${formattedItem}</div>
            </div>
          </div>
        `;
      }
      if (formattedItem.toLowerCase().includes('flow') || formattedItem.toLowerCase().includes('evm')) {
        return `
          <div class="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl my-2 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-3">
              <span class="text-blue-500 text-lg flex-shrink-0">🌊</span>
              <div class="flex-1">${formattedItem}</div>
            </div>
          </div>
        `;
      }
      
      return `
        <div class="bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded-xl my-2 hover:shadow-md transition-all duration-300">
          <div class="flex items-start gap-3">
            <span class="text-gray-400 text-lg flex-shrink-0">📝</span>
            <div class="flex-1">${formattedItem}</div>
          </div>
        </div>
      `;
    })
    .join('');
};

const formatTokenTransfers = (content: string): string => {
  if (!content) return '';
  
  // Split content into groups (each token transfer is a group of related lines)
  const transfers = content.split('\n\n').map(group => group.trim()).filter(group => group);
  
  return transfers.map(transfer => {
    const lines = transfer.split('\n')
      .map(line => line.trim())
      .filter(line => line);
    
    return `
      <div class="bg-gradient-to-r from-white to-blue-50/30 border border-blue-200/50 p-5 mb-4 rounded-xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
        ${lines.map(line => {
          const [key, value] = line.split(':').map(part => part.trim());
          if (!value) {
            return `<div class="text-gray-800 py-2 font-medium">${key}</div>`;
          }
          // Highlight FLOW tokens with special styling
          const displayValue = value.includes('FLOW') ? 
            `<span class="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">${value}</span>` : 
            `<span class="text-gray-800 font-medium">${value}</span>`;
          return `
            <div class="flex items-center py-3 border-b border-gray-100/50 last:border-0 hover:bg-blue-50/20 rounded-lg px-2 -mx-2 transition-all duration-200">
              <div class="flex items-center gap-2 min-w-[120px]">
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span class="text-gray-600 font-medium text-sm">${key}:</span>
              </div>
              <div class="ml-3 flex-1">${displayValue}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');
};

export const formatTransferSection = (content: string): string => {
  if (!content) return `
    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
      <div class="text-gray-400 text-4xl mb-2">🚫</div>
      <div class="text-gray-500 font-medium">No transfers detected</div>
      <div class="text-gray-400 text-sm mt-1">This transaction doesn't contain any token transfers</div>
    </div>
  `;
  
  // Handle both old ---Sub Section--- format and new markdown ### format
  let parts: string[];
  if (content.includes('---Sub Section---')) {
    parts = content.split('---Sub Section---');
  } else {
    // Split by markdown sub-headers or look for section patterns
    parts = content.split(/(?=###\s+)/);
    // If no markdown headers, treat entire content as one section
    if (parts.length === 1) {
      parts = [content];
    }
  }
  
  let html = '';
  
  parts.forEach(part => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return;
    
    if (trimmedPart.includes('Native Currency') || trimmedPart.includes('FLOW')) {
      html += `
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 p-6 mb-4 rounded-2xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-blue-500 rounded-xl">
              <span class="text-white text-lg">💰</span>
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900">Native FLOW Transfer</h4>
              <p class="text-sm text-blue-600 font-medium">Flow blockchain native currency</p>
            </div>
          </div>
          ${formatList(trimmedPart.replace(/###\s*Native Currency/i, '').replace('Native Currency:', '').trim())}
        </div>
      `;
    }
    else if (trimmedPart.includes('Token Transfers') || trimmedPart.includes('ERC20')) {
      html += `
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 p-6 mb-4 rounded-2xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-green-500 rounded-xl">
              <span class="text-white text-lg">🪙</span>
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900">Token Transfers</h4>
              <p class="text-sm text-green-600 font-medium">ERC20 compatible tokens on Flow EVM</p>
            </div>
          </div>
          ${formatTokenTransfers(trimmedPart.replace(/###\s*Token Transfers.*/i, '').replace('Token Transfers (ERC20):', '').trim())}
        </div>
      `;
    }
    else if (trimmedPart.includes('NFT Transfers')) {
      html += `
        <div class="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200/50 p-6 mb-4 rounded-2xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-pink-500 rounded-xl">
              <span class="text-white text-lg">🖼️</span>
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900">NFT Transfers</h4>
              <p class="text-sm text-pink-600 font-medium">Non-fungible tokens (ERC721/ERC1155)</p>
            </div>
          </div>
          ${formatTokenTransfers(trimmedPart.replace(/###\s*NFT Transfers.*/i, '').replace('NFT Transfers (ERC721/ERC1155):', '').trim())}
        </div>
      `;
    }
    else {
      // Handle general transfer content that doesn't match specific patterns
      html += `
        <div class="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200/50 p-6 mb-4 rounded-2xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-gray-500 rounded-xl">
              <span class="text-white text-lg">📊</span>
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900">Transfer Information</h4>
              <p class="text-sm text-gray-600 font-medium">Additional transfer details</p>
            </div>
          </div>
          ${formatList(trimmedPart)}
        </div>
      `;
    }
  });
  
  return html || `
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <div class="text-amber-400 text-4xl mb-2">⏳</div>
      <div class="text-amber-600 font-medium">Analysis in progress...</div>
      <div class="text-amber-500 text-sm mt-1">Processing transfer data</div>
    </div>
  `;
};

// Helper function to extract section content and check if it should be shown
const getSectionContent = (section: string, sectionName: string): string | null => {
  const patterns = [
    new RegExp(`##\\s*${sectionName}`, 'i'),
    new RegExp(`###\\s*${sectionName}`, 'i'),
    new RegExp(`${sectionName}:`, 'i')
  ];
  
  let content = section;
  for (const pattern of patterns) {
    content = content.replace(pattern, '');
  }
  
  // Remove any remaining markdown headers (# symbols)
  content = content.replace(/^#+\s*/gm, '');
  content = content.trim();
  
  // Only filter out if the content is truly empty or explicitly "Not applicable"
  if (!content || content.match(/^\s*$/)) {
    return null;
  }
  
  // Only skip sections that are entirely "Not applicable" - be less aggressive
  if (content.toLowerCase().trim() === 'not applicable' ||
      content.toLowerCase().trim() === 'unknown' ||
      content.toLowerCase().trim() === 'n/a') {
    return null;
  }
  
  return content;
};

export const formatAssistantMessage = (content: string): string => {
  if (!content) return '';
  
  // Handle both old ---Section--- format and new markdown ## format
  let sections: string[];
  if (content.includes('---Section---')) {
    sections = content.split('---Section---');
  } else {
    // Split by markdown headers
    sections = content.split(/(?=##\s+[A-Z\s&]+)/);
  }
  
  let formattedContent = '';
  
  sections.forEach(section => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return;
    
    if (trimmedSection.includes('TRANSACTION OVERVIEW')) {
      const content = getSectionContent(trimmedSection, 'TRANSACTION OVERVIEW');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <span class="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-1">Transaction Overview</h3>
                  <p class="text-sm text-blue-600 font-medium">Comprehensive Flow EVM analysis</p>
                </div>
              </div>
              <div class="flex gap-2">
                ${extractComplexityBadge(trimmedSection)}
                <div class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                  Flow EVM
                </div>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('NETWORK DETAILS')) {
      const content = getSectionContent(trimmedSection, 'NETWORK DETAILS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg">
                <span class="text-2xl">🌊</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Network Details</h3>
                <p class="text-sm text-emerald-600 font-medium">Flow blockchain network information</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('TRANSFER ANALYSIS')) {
      const content = getSectionContent(trimmedSection, 'TRANSFER ANALYSIS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                <span class="text-2xl">↔️</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Transfer Analysis</h3>
                <p class="text-sm text-purple-600 font-medium">Token and value movements on Flow</p>
              </div>
            </div>
            <div class="space-y-4">
              ${formatTransferSection(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('PERFORMANCE ANALYSIS')) {
      const content = getSectionContent(trimmedSection, 'PERFORMANCE ANALYSIS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg">
                <span class="text-2xl">📊</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Performance Analysis</h3>
                <p class="text-sm text-orange-600 font-medium">Gas efficiency and optimization insights</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('CONTRACT INTERACTIONS')) {
      const content = getSectionContent(trimmedSection, 'CONTRACT INTERACTIONS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg">
                <span class="text-2xl">📝</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Contract Interactions</h3>
                <p class="text-sm text-yellow-600 font-medium">Smart contract calls and executions</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('graph TD;') || trimmedSection.includes('graph LR;') || trimmedSection.includes('sequenceDiagram')) {
      formattedContent += `<div class="mermaid">${trimmedSection}</div>`;
    }
    else if (trimmedSection.includes('COST ANALYSIS')) {
      const content = getSectionContent(trimmedSection, 'COST ANALYSIS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg">
                <span class="text-2xl">⛽</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Cost Analysis</h3>
                <p class="text-sm text-green-600 font-medium">Gas fees and transaction costs</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('SECURITY ASSESSMENT')) {
      const content = getSectionContent(trimmedSection, 'SECURITY ASSESSMENT');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                  <span class="text-2xl">🛡️</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-1">Security Assessment</h3>
                  <p class="text-sm text-red-600 font-medium">Comprehensive risk evaluation</p>
                </div>
              </div>
              ${extractRiskBadge(trimmedSection)}
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('DEX INTERACTIONS')) {
      const content = getSectionContent(trimmedSection, 'DEX INTERACTIONS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
                <span class="text-2xl">🔄</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">DEX Interactions</h3>
                <p class="text-sm text-indigo-600 font-medium">Decentralized exchange activity</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('MEV') || trimmedSection.includes('ARBITRAGE')) {
      const content = getSectionContent(trimmedSection, 'MEV & ARBITRAGE ANALYSIS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
                <span class="text-2xl">⚡</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">MEV & Arbitrage Analysis</h3>
                <p class="text-sm text-red-600 font-medium">Advanced extraction pattern detection</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('ADDITIONAL INSIGHTS')) {
      const content = getSectionContent(trimmedSection, 'ADDITIONAL INSIGHTS');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-slate-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-lg">
                <span class="text-2xl">💡</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Additional Insights</h3>
                <p class="text-sm text-slate-600 font-medium">Patterns and optimization recommendations</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('INFORMATION')) {
      const content = getSectionContent(trimmedSection, 'INFORMATION');
      if (content) {
        formattedContent += `
          <div class="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200/50 p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg">
                <span class="text-2xl">📊</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">Transaction Information</h3>
                <p class="text-sm text-gray-600 font-medium">Blockchain metadata and details</p>
              </div>
            </div>
            <div class="space-y-3">
              ${formatList(content)}
            </div>
          </div>
        `;
      }
    }
    else if (trimmedSection.includes('graph TD;') || trimmedSection.includes('graph LR;') || trimmedSection.includes('sequenceDiagram')) {
      formattedContent += `<div class="mermaid">${trimmedSection}</div>`;
    }
    else if (trimmedSection.length > 20) {
      // Extract section title from content if available
      let sectionTitle = "Analysis Details";
      let sectionSubtitle = "Additional transaction insights";
      let sectionIcon = "📝";
      let sectionColor = "blue";
      
      // Try to extract meaningful section title
      const titleMatch = trimmedSection.match(/^##\s*([^#\n]+)/);
      if (titleMatch) {
        sectionTitle = titleMatch[1].trim();
        
        // Customize based on extracted title
        if (sectionTitle.toLowerCase().includes('bridge')) {
          sectionIcon = "🌉";
          sectionSubtitle = "Cross-chain bridge analysis";
          sectionColor = "purple";
        } else if (sectionTitle.toLowerCase().includes('volume')) {
          sectionIcon = "📊";
          sectionSubtitle = "Volume and liquidity metrics";
          sectionColor = "green";
        } else if (sectionTitle.toLowerCase().includes('resource')) {
          sectionIcon = "🏗️";
          sectionSubtitle = "Resource utilization details";
          sectionColor = "orange";
        } else if (sectionTitle.toLowerCase().includes('capabilit')) {
          sectionIcon = "⚡";
          sectionSubtitle = "System capabilities overview";
          sectionColor = "yellow";
        } else if (sectionTitle.toLowerCase().includes('service')) {
          sectionIcon = "🔧";
          sectionSubtitle = "Service interaction analysis";
          sectionColor = "indigo";
        } else if (sectionTitle.toLowerCase().includes('protocol')) {
          sectionIcon = "🔗";
          sectionSubtitle = "Protocol classification details";
          sectionColor = "teal";
        } else if (sectionTitle.toLowerCase().includes('token')) {
          sectionIcon = "🪙";
          sectionSubtitle = "Token transfer analysis";
          sectionColor = "emerald";
        } else if (sectionTitle.toLowerCase().includes('amount')) {
          sectionIcon = "💰";
          sectionSubtitle = "Transaction amount details";
          sectionColor = "cyan";
        } else if (sectionTitle.toLowerCase().includes('explorer')) {
          sectionIcon = "🔍";
          sectionSubtitle = "Blockchain explorer information";
          sectionColor = "slate";
        }
      }
      
      const colorMap = {
        blue: "from-blue-50 to-cyan-50 border-blue-200/50 from-blue-600 to-blue-700 text-blue-600",
        purple: "from-purple-50 to-violet-50 border-purple-200/50 from-purple-600 to-purple-700 text-purple-600",
        green: "from-green-50 to-emerald-50 border-green-200/50 from-green-600 to-green-700 text-green-600",
        orange: "from-orange-50 to-amber-50 border-orange-200/50 from-orange-600 to-orange-700 text-orange-600",
        yellow: "from-yellow-50 to-amber-50 border-yellow-200/50 from-yellow-600 to-yellow-700 text-yellow-600",
        indigo: "from-indigo-50 to-blue-50 border-indigo-200/50 from-indigo-600 to-indigo-700 text-indigo-600",
        teal: "from-teal-50 to-cyan-50 border-teal-200/50 from-teal-600 to-teal-700 text-teal-600",
        emerald: "from-emerald-50 to-green-50 border-emerald-200/50 from-emerald-600 to-emerald-700 text-emerald-600",
        cyan: "from-cyan-50 to-blue-50 border-cyan-200/50 from-cyan-600 to-cyan-700 text-cyan-600",
        slate: "from-slate-50 to-gray-50 border-slate-200/50 from-slate-600 to-slate-700 text-slate-600"
      };
      
      const colors = colorMap[sectionColor] || colorMap.blue;
      const [bgGradient, borderColor, iconGradient, textColor] = colors.split(' ');
      
      formattedContent += `
        <div class="bg-gradient-to-br ${bgGradient} rounded-2xl border ${borderColor} p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 bg-gradient-to-br ${iconGradient} rounded-xl shadow-lg">
              <span class="text-2xl">${sectionIcon}</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-1">${sectionTitle}</h3>
              <p class="text-sm ${textColor} font-medium">${sectionSubtitle}</p>
            </div>
          </div>
          <div class="space-y-3">
            ${formatList(trimmedSection)}
          </div>
        </div>
      `;
    }
  });
  
  return formattedContent || `
    <div class="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200/50 p-8 shadow-lg">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg">
          <span class="text-2xl">📋</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">Analysis Results</h3>
          <p class="text-sm text-gray-600 font-medium">Transaction analysis output</p>
        </div>
      </div>
      <div class="text-gray-700 whitespace-pre-wrap font-mono text-sm bg-white rounded-xl p-4 border border-gray-200">${content}</div>
    </div>
  `;
};