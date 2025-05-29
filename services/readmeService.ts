
import { ReadmeData } from '../types';

const generateSection = (title: string, content?: string | string[], listAs?: 'bullet' | 'numbered' | 'none' | 'code'): string => {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return '';
  }

  let sectionContent = `## ${title}\n\n`;

  if (Array.isArray(content)) {
    if (listAs === 'code' && content.length > 0) {
        sectionContent += "```sh\n"; // Default to shell, can be made dynamic
        sectionContent += content.join('\n');
        sectionContent += "\n```\n\n";
    } else {
        sectionContent += content.map(item => `${listAs === 'numbered' ? '1.' : '-'} ${item}`).join('\n') + '\n\n';
    }
  } else {
    sectionContent += `${content}\n\n`;
  }
  return sectionContent;
};

export const generateReadmeContent = (data: ReadmeData): string => {
  let markdown = `# ${data.projectName || 'My Awesome Project'}\n\n`;

  if (data.description) {
    markdown += `${data.description}\n\n`;
  }
  
  // Optional: Add badges here if you implement a badge feature
  // markdown += `![License](https://img.shields.io/badge/license-${data.license.replace(/\s+/g, '%20')}-blue.svg)\n\n`;


  // Table of Contents (optional, basic version)
  markdown += `## Table of Contents\n\n`;
  const tocItems: string[] = [];
  if (data.overview) tocItems.push('[About The Project](#about-the-project)');
  if (data.liveDemoUrl) tocItems.push('[Live Demo](#live-demo)');
  if (data.features && data.features.length > 0) tocItems.push('[Key Features](#key-features)');
  if (data.technologies && data.technologies.length > 0) tocItems.push('[Built With](#built-with)');
  tocItems.push('[Getting Started](#getting-started)');
  if (data.usage) tocItems.push('[Usage](#usage)');
  if (data.roadmap) tocItems.push('[Roadmap](#roadmap)');
  if (data.contributing) tocItems.push('[Contributing](#contributing)');
  if (data.license) tocItems.push('[License](#license)');
  if (data.contact) tocItems.push('[Contact](#contact)');
  if (data.acknowledgements) tocItems.push('[Acknowledgements](#acknowledgements)');
  
  markdown += tocItems.map(item => `- ${item}`).join('\n') + '\n\n';


  if (data.overview) {
    markdown += `## About The Project\n\n${data.overview}\n\n`;
  }
  
  if (data.liveDemoUrl) {
     markdown += `## Live Demo\n\n`;
     markdown += `Check out the live demo here: [${data.projectName} Demo](${data.liveDemoUrl})\n\n`;
  }

  markdown += generateSection('Key Features', data.features, 'bullet');
  markdown += generateSection('Built With', data.technologies, 'bullet');

  // Getting Started
  markdown += `## Getting Started\n\nTo get a local copy up and running follow these simple example steps.\n\n`;
  if (data.prerequisites) {
    markdown += `### Prerequisites\n\nThis is an example of how to list things you need to use the software and how to install them.\n`;
    // Treat prerequisites as potentially multi-line or code block
    if (data.prerequisites.includes('\n') || data.prerequisites.startsWith('`') || data.prerequisites.includes('```')) {
         markdown += `${data.prerequisites}\n\n`;
    } else {
         markdown += "```sh\n";
         markdown += data.prerequisites;
         markdown += "\n```\n\n";
    }
  }
  if (data.installation) {
    markdown += `### Installation\n\n${data.installation}\n\n`;
  }

  markdown += generateSection('Usage', data.usage);
  markdown += generateSection('Roadmap', data.roadmap);
  markdown += generateSection('Contributing', data.contributing);
  markdown += generateSection('License', data.license);
  markdown += generateSection('Contact', data.contact);
  markdown += generateSection('Acknowledgements', data.acknowledgements);

  return markdown;
};
