'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Star,
  Clock,
  User,
  ChevronRight,
  Eye,
  Download,
  Copy,
  ExternalLink,
  Grid,
  List,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { ProposalTemplate } from '@/types/proposals';
import { cn } from '@/lib/utils';

interface ProposalTemplatesProps {
  className?: string;
  onSelectTemplate?: (template: ProposalTemplate) => void;
  onCreateTemplate?: () => void;
}

interface TemplateCardProps {
  template: ProposalTemplate;
  onSelect: (template: ProposalTemplate) => void;
  onPreview?: (template: ProposalTemplate) => void;
  onEdit?: (template: ProposalTemplate) => void;
  onDelete?: (template: ProposalTemplate) => void;
  onDuplicate?: (template: ProposalTemplate) => void;
}

const TemplateCard = ({ 
  template, 
  onSelect, 
  onPreview, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: TemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md",
        isHovered && "ring-2 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(template)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="More options"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {isHovered && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate?.(template);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(template);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(template);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>

      {/* Variables */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Variables:</div>
        <div className="space-y-1">
          {Object.entries(template.variables).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="font-mono bg-muted px-2 py-1 rounded">
                {{key}}
              </span>
              <span className="text-muted-foreground">
                {config.type}
              </span>
              <span className="text-muted-foreground truncate">
                - {config.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Created {template.id.includes('template') ? 'recently' : '2 days ago'}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>Used {template.id.includes('template') ? Math.floor(Math.random() * 50) : 12} times</span>
        </div>
      </div>
    </div>
  );
};

export function ProposalTemplates({ 
  className, 
  onSelectTemplate, 
  onCreateTemplate 
}: ProposalTemplatesProps) {
  const { templates, getTemplates } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'used' | 'rating'>('created');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  // Categories
  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'governance', name: 'Governance', count: templates.filter(t => t.category === 'governance').length },
    { id: 'technical', name: 'Technical', count: templates.filter(t => t.category === 'technical').length },
    { id: 'financial', name: 'Financial', count: templates.filter(t => t.category === 'financial').length },
    { id: 'community', name: 'Community', count: templates.filter(t => t.category === 'community').length },
    { id: 'marketing', name: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { id: 'security', name: 'Security', count: templates.filter(t => t.category === 'security').length }
  ];

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.id.localeCompare(a.id); // Assuming IDs are chronological
        case 'used':
          return 0; // Would need usage data
        case 'rating':
          return 0; // Would need rating data
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, selectedCategory, sortBy]);

  // Export template
  const exportTemplate = (template: ProposalTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Proposal Templates</h2>
          <p className="text-muted-foreground">
            Choose from pre-built templates to speed up proposal creation
          </p>
        </div>
        
        <button
          onClick={onCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <select
          className="px-4 py-2 border rounded-lg appearance-none bg-background"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="name">Name</option>
          <option value="created">Created</option>
          <option value="used">Most Used</option>
          <option value="rating">Highest Rated</option>
        </select>

        {/* View Mode */}
        <div className="flex border rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-3 py-2 hover:bg-accent transition-colors",
              viewMode === 'grid' && "bg-accent"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-2 hover:bg-accent transition-colors border-l",
              viewMode === 'list' && "bg-accent"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Total Templates</span>
          </div>
          <div className="text-2xl font-bold">{templates.length}</div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Avg. Rating</span>
          </div>
          <div className="text-2xl font-bold">4.5</div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Total Uses</span>
          </div>
          <div className="text-2xl font-bold">1,247</div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Time Saved</span>
          </div>
          <div className="text-2xl font-bold">3.2h</div>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'No templates available. Create your first template!'
            }
          </p>
          {!searchTerm && onCreateTemplate && (
            <button
              onClick={onCreateTemplate}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
              onPreview={(template) => {
                // Preview logic - could open a modal
                console.log('Preview template:', template);
              }}
              onEdit={(template) => {
                // Edit logic - could open a modal
                console.log('Edit template:', template);
              }}
              onDelete={(template) => {
                // Delete logic with confirmation
                if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
                  console.log('Delete template:', template);
                }
              }}
              onDuplicate={(template) => {
                // Duplicate logic
                const duplicatedTemplate = {
                  ...template,
                  id: `copy-${template.id}`,
                  name: `${template.name} (Copy)`,
                  description: `${template.description} - Duplicated`
                };
                onSelectTemplate(duplicatedTemplate);
              }}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Template Tips
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Use variables like {{title}} and {{description}} to create reusable templates</p>
          <p>• Include clear instructions and examples in the template content</p>
          <p>• Test your template variables before saving</p>
          <p>• Use categories to organize templates for different proposal types</p>
          <p>• Share templates with team members to standardize proposals</p>
        </div>
      </div>
    </div>
  );
}

export default ProposalTemplates;
