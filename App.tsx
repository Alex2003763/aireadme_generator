import React, { useState, useCallback, useEffect } from 'react';
import { ReadmeData, SectionKey, GithubRepoInfo, AiGeneratedSections, SelectOption } from './types';
import { generateReadmeContent } from './services/readmeService.js';
import { generateDescriptionWithAI, generateReadmeSectionsFromCodeWithAI } from './services/openRouterService.js';
import { fetchProjectDetails } from './services/githubService.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SectionCard from './components/SectionCard.jsx';
import InputField from './components/InputField.jsx';
import TextAreaField from './components/TextAreaField.jsx';
import ArrayInputField from './components/ArrayInputField.jsx';
import SelectField from './components/SelectField.jsx';
import Button from './components/Button.jsx';
import GeneratedPreview from './components/GeneratedPreview.jsx';
import Spinner from './components/Spinner.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { DEFAULT_README_DATA, SECTIONS_CONFIG } from './constants.js';

const OPENROUTER_API_KEY_LS = 'openRouterApiKey';

const App: React.FC = () => {
  const [readmeData, setReadmeData] = useState<ReadmeData>(DEFAULT_README_DATA);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [isLoadingAiDescription, setIsLoadingAiDescription] = useState<boolean>(false);
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [isProcessingRepo, setIsProcessingRepo] = useState<boolean>(false);
  const [githubFetchError, setGithubFetchError] = useState<string | null>(null);
  
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [apiKeyMessage, setApiKeyMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(OPENROUTER_API_KEY_LS);
    if (storedApiKey) {
      setOpenRouterApiKey(storedApiKey);
      setApiKeyMessage(null); // Key found, clear any "not set" message
    } else {
      setApiKeyMessage("Warning: OpenRouter API Key not set. AI features are disabled. Please configure it in Settings (⚙️ icon).");
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem(OPENROUTER_API_KEY_LS, key.trim());
      setOpenRouterApiKey(key.trim());
      setApiKeyMessage(null); // Key saved, clear warning
      alert("OpenRouter API Key saved successfully!");
    } else {
      localStorage.removeItem(OPENROUTER_API_KEY_LS);
      setOpenRouterApiKey(null);
      setApiKeyMessage("Warning: OpenRouter API Key removed. AI features are disabled. Please configure it in Settings (⚙️ icon).");
      alert("OpenRouter API Key removed.");
    }
  };

  const handleInputChange = useCallback((sectionOrKey: SectionKey | 'githubUrl', value: string | string[]) => {
    if (sectionOrKey === 'githubUrl' && typeof value === 'string') {
      setGithubUrl(value);
      setGithubFetchError(null); 
    } else if (sectionOrKey !== 'githubUrl') {
       setReadmeData(prev => ({ ...prev, [sectionOrKey]: value }));
    }
  }, []);

  const handleFetchFromGithub = async () => {
    if (!githubUrl.trim()) {
      setGithubFetchError("Please enter a GitHub repository URL.");
      return;
    }
    setIsProcessingRepo(true);
    setGithubFetchError(null);
    try {
      const githubDetails: GithubRepoInfo = await fetchProjectDetails(githubUrl);
      
      let updatedData: Partial<ReadmeData> = {
        projectName: githubDetails.name || readmeData.projectName,
        description: githubDetails.description || readmeData.description || '',
        technologies: [...new Set([...(githubDetails.languages || []), ...(githubDetails.topics || [])])],
        // License will be handled by AI or remain default if not from AI/specific GitHub license parsing.
        // The existing default or user-selected full license text will be kept.
        // If GitHub API provided a simple license name, we could try to match it to PRESET_LICENSE_OPTIONS,
        // but for now, we let AI or user choice dictate the full license text.
        license: readmeData.license, // Keep current or default full text license
        contact: `Owner: ${githubDetails.ownerLogin}\nProject Link: ${githubDetails.html_url}`,
        installation: `1. Clone the repo\n   \`\`\`sh\n   git clone ${githubDetails.clone_url}\n   \`\`\`\n2. Navigate to the project directory\n   \`\`\`sh\n   cd ${githubDetails.name}\n   \`\`\`\n3. Install dependencies (Update with your project's specific commands, e.g., npm install or pip install -r requirements.txt)`,
        overview: readmeData.overview || `An overview of ${githubDetails.name}. This project aims to...`,
        prerequisites: readmeData.prerequisites || '',
      };
      
      // If GitHub API provides a recognized license name, try to use its full text
      if (githubDetails.licenseName) {
        const foundPresetLicense = SECTIONS_CONFIG.find(s => s.key === 'license')?.options?.find(
          opt => opt.name.toLowerCase().includes(githubDetails.licenseName?.toLowerCase() || '') || 
                 (githubDetails.licenseName?.toLowerCase().startsWith(opt.name.split(" ")[0].toLowerCase()) && opt.name !== 'Other (Specify in README)')
        );
        if (foundPresetLicense) {
          updatedData.license = foundPresetLicense.value;
        }
      }


      if (openRouterApiKey && githubDetails.fetchedFiles && githubDetails.fetchedFiles.length > 0) {
        try {
          const aiSections: AiGeneratedSections | null = await generateReadmeSectionsFromCodeWithAI(openRouterApiKey, githubDetails);
          if (aiSections) {
            updatedData = {
              ...updatedData,
              overview: aiSections.overview || updatedData.overview,
              features: aiSections.features || updatedData.features || [],
              installation: aiSections.installation || updatedData.installation,
              prerequisites: aiSections.prerequisites || updatedData.prerequisites,
              technologies: [...new Set([
                  ...(updatedData.technologies || []),
                  ...(aiSections.technologies || [])
              ])],
            };
          }
        } catch (aiError) {
          console.error("Error generating README sections with AI:", aiError);
          const errorMsg = aiError instanceof Error ? aiError.message : 'Unknown AI error';
          setGithubFetchError(prevError => `${prevError || ''} AI section generation failed: ${errorMsg}. Using basic GitHub prefill.`);
          if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("invalid api key")) {
             setApiKeyMessage("Error: Invalid OpenRouter API Key. Please check your key in Settings (⚙️ icon). AI features disabled.");
          }
        }
      } else if (!openRouterApiKey) {
         console.log("OpenRouter API key not set. Skipping AI-powered section generation.");
         setGithubFetchError(prevError => `${prevError || ''} OpenRouter API key not set. AI section generation skipped. Set key in Settings.`);
      }


      setReadmeData(prev => ({
        ...prev,
        ...updatedData,
        features: Array.isArray(updatedData.features) ? updatedData.features : (prev.features || []),
        technologies: Array.isArray(updatedData.technologies) ? updatedData.technologies : (prev.technologies || [])
      }));

      alert("Project data processed and pre-filled! Review and customize as needed.");

    } catch (error) {
      console.error("Error fetching/processing from GitHub:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setGithubFetchError(`Failed to process data from GitHub: ${errorMessage}`);
    } finally {
      setIsProcessingRepo(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!openRouterApiKey) {
      alert("OpenRouter API Key is not configured. Cannot generate description. Please set it in Settings (⚙️ icon).");
      setIsSettingsModalOpen(true);
      return;
    }
    if (!readmeData.projectName.trim()) {
      alert("Please enter a project name first.");
      return;
    }
    setIsLoadingAiDescription(true);
    try {
      const description = await generateDescriptionWithAI(openRouterApiKey, readmeData.projectName, readmeData.description);
      setReadmeData(prev => ({ ...prev, description }));
    } catch (error) {
      console.error("Error generating description with AI:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate description. ${errorMsg}`);
      if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("invalid api key")) {
        setApiKeyMessage("Error: Invalid OpenRouter API Key. Please check your key in Settings (⚙️ icon). AI features disabled.");
      }
    } finally {
      setIsLoadingAiDescription(false);
    }
  };

  const handleGeneratePreview = () => {
    const markdown = generateReadmeContent(readmeData);
    setGeneratedMarkdown(markdown);
  };

  const handleDownload = () => {
    if (!generatedMarkdown) {
      alert("Please generate the README preview first.");
      return;
    }
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!generatedMarkdown) {
      alert("Please generate the README preview first.");
      return;
    }
    navigator.clipboard.writeText(generatedMarkdown)
      .then(() => alert("README content copied to clipboard!"))
      .catch(err => {
        console.error("Failed to copy to clipboard:", err);
        alert("Failed to copy content. Please try manually.");
      });
  };

  const githubButtonText = openRouterApiKey ? 'Fetch & Analyze Project with AI' : 'Fetch & Prefill from GitHub';

  return (
    <div className="min-h-screen flex flex-col bg-slate-800 text-slate-100">
      <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveApiKey={handleSaveApiKey}
        currentApiKey={openRouterApiKey}
      />

      {apiKeyMessage && (
        <div className={`p-3 text-center text-sm text-white ${apiKeyMessage.toLowerCase().includes("error") ? 'bg-red-600' : 'bg-yellow-600'}`}>
          {apiKeyMessage}
           {!apiKeyMessage.toLowerCase().includes("error") && <button onClick={() => setIsSettingsModalOpen(true)} className="ml-2 underline hover:text-yellow-200">Configure now</button>}
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section - now bg-slate-900 for contrast with body bg-slate-800 */}
          <div className="space-y-6 bg-slate-900 p-6 rounded-xl shadow-2xl">
            
            <SectionCard title="🚀 Import from GitHub" description="Enter your GitHub repository URL. We'll fetch details. If an OpenRouter API key is set, AI will help generate content.">
              <div className="space-y-3">
                <InputField
                  id="githubUrl"
                  label="GitHub Repository URL"
                  value={githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  placeholder="e.g., https://github.com/username/my-project"
                />
                {githubFetchError && <p className="text-sm text-red-400">{githubFetchError}</p>}
                <Button
                  onClick={handleFetchFromGithub}
                  disabled={isProcessingRepo || !githubUrl.trim()}
                  className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
                >
                  {isProcessingRepo && <Spinner size="sm" />}
                  {isProcessingRepo ? 'Processing Repository...' : githubButtonText}
                </Button>
              </div>
            </SectionCard>

            {SECTIONS_CONFIG.map(section => (
              <SectionCard key={section.key} title={section.title} description={section.description}>
                {section.type === 'input' && (
                  <InputField
                    id={section.key}
                    value={readmeData[section.key] as string || ''}
                    onChange={(e) => handleInputChange(section.key, e.target.value)}
                    placeholder={section.placeholder}
                  />
                )}
                {section.type === 'textarea' && (
                  <TextAreaField
                    id={section.key}
                    value={readmeData[section.key] as string || ''}
                    onChange={(e) => handleInputChange(section.key, e.target.value)}
                    placeholder={section.placeholder}
                    rows={section.key === 'description' || section.key === 'overview' || section.key === 'installation' ? 5 : 3}
                  />
                )}
                {section.type === 'array' && (
                  <ArrayInputField
                    id={section.key}
                    items={readmeData[section.key] as string[] || []}
                    onChange={(items) => handleInputChange(section.key, items)}
                    placeholder={section.placeholder}
                    noun={section.noun || 'item'}
                  />
                )}
                 {section.type === 'select' && section.options && (
                  <SelectField
                    id={section.key}
                    value={readmeData[section.key] as string || ''}
                    onChange={(e) => handleInputChange(section.key, e.target.value)}
                    options={section.options as SelectOption[]} // options are already SelectOption[] from constants
                  />
                )}
                {section.key === 'description' && (
                  <Button 
                    onClick={handleGenerateDescription} 
                    disabled={isLoadingAiDescription || !openRouterApiKey}
                    className="mt-2 w-full flex items-center justify-center bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600"
                    title={!openRouterApiKey ? "Set OpenRouter API Key in Settings to enable AI" : "Generate short description using AI"}
                  >
                    {isLoadingAiDescription && <Spinner size="sm" />}
                    {isLoadingAiDescription ? 'Generating...' : '✨ Generate Short Desc. with AI'}
                  </Button>
                )}
              </SectionCard>
            ))}
             <div className="flex flex-col sm:flex-row gap-4 mt-8 sticky bottom-0 py-4 bg-slate-900 z-10">
                <Button onClick={handleGeneratePreview} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  📋 Generate Preview
                </Button>
                <Button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700" disabled={!generatedMarkdown}>
                  💾 Download .md
                </Button>
                <Button onClick={handleCopyToClipboard} className="flex-1 bg-sky-600 hover:bg-sky-700" disabled={!generatedMarkdown}>
                  🔗 Copy to Clipboard
                </Button>
              </div>
          </div>

          {/* Preview Section - now bg-slate-900 */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-2xl lg:sticky lg:top-8 self-start max-h-[calc(100vh-10rem)] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">README.md Preview</h2>
            <GeneratedPreview markdown={generatedMarkdown} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;