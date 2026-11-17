import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Code,
  Plus,
  Trash2,
  FileDown,
  Loader2,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { exportSchemaToPdf } from '../services/pdfExportService';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  badge,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {title}
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3 text-xs">
          {children}
        </div>
      )}
    </div>
  );
}

type SchemaType =
  | 'Article'
  | 'LocalBusiness'
  | 'FAQPage'
  | 'HowTo'
  | 'Product'
  | 'MultiProduct'
  | 'Person'
  | 'Organization'
  | 'BreadcrumbList'
  | 'Recipe'
  | 'MultiRecipe'
  | 'JobPosting';

const SCHEMA_LABELS: Record<SchemaType, string> = {
  Article: 'Article',
  LocalBusiness: 'LocalBusiness',
  FAQPage: 'FAQPage',
  Product: 'Product',
  MultiProduct: 'Multi-Product',
  Person: 'Person',
  Organization: 'Organization',
  BreadcrumbList: 'BreadcrumbList',
  HowTo: 'HowTo',
  JobPosting: 'JobPosting',
  Recipe: 'Recipe',
  MultiRecipe: 'Multi-Recipe',
};

interface MultiProductItem {
  id: string;
  name: string;
  brand: string;
  description: string;
  image: string;
  url: string;
  price: string;
  salePrice: string;
  priceValidUntil: string;
  currency: string;
  availability: string;
  rating: string;
  reviewCount: string;
}

function buildProductOffer(opts: {
  price: string;
  salePrice?: string;
  priceValidUntil?: string;
  currency: string;
  availability?: string;
  url?: string;
}) {
  const regular = opts.price.trim();
  const sale = opts.salePrice?.trim() || '';
  const currency = opts.currency.trim() || 'USD';
  const validUntil = opts.priceValidUntil?.trim() || '';
  const url = opts.url?.trim() || '';
  const activePrice = sale || regular;

  return {
    '@type': 'Offer',
    price: activePrice,
    priceCurrency: currency,
    availability: opts.availability || 'https://schema.org/InStock',
    ...(validUntil ? { priceValidUntil: validUntil } : {}),
    ...(url ? { url } : {}),
    ...(sale && regular
      ? {
          priceSpecification: [
            {
              '@type': 'UnitPriceSpecification',
              priceType: 'https://schema.org/ListPrice',
              price: regular,
              priceCurrency: currency,
            },
            {
              '@type': 'UnitPriceSpecification',
              priceType: 'https://schema.org/SalePrice',
              price: sale,
              priceCurrency: currency,
            },
          ],
        }
      : {}),
  };
}

interface MultiRecipeItem {
  id: string;
  name: string;
  author: string;
  description: string;
  image: string;
  url: string;
  prepTime: string;
  cookTime: string;
  recipeYield: string;
  recipeCategory: string;
  ingredients: string[];
  instructions: string[];
}

export function SchemaGeneratorPage() {
  const [schemaType, setSchemaType] = useState<SchemaType>('Article');
  const [copied, setCopied] = useState(false);

  // Article
  const [articleHeadline, setArticleHeadline] = useState('How to Improve Your SEO Rankings in 2026');
  const [articleDesc, setArticleDesc] = useState('A comprehensive guide to modern on-page and technical SEO techniques.');
  const [articleAuthor, setArticleAuthor] = useState('Alex Mercer');
  const [articleImage, setArticleImage] = useState('https://example.com/cover.jpg');
  const [articlePublisher, setArticlePublisher] = useState('SEO Academy');
  const [articleDate, setArticleDate] = useState('2026-03-15');

  // LocalBusiness
  const [bizName, setBizName] = useState('Premier Web Solutions');
  const [bizType, setBizType] = useState('ProfessionalService');
  const [bizAddress, setBizAddress] = useState('123 Market St, San Francisco, CA');
  const [bizPhone, setBizPhone] = useState('+1-555-019-2831');
  const [bizUrl, setBizUrl] = useState('https://premierwebsolutions.com');

  // FAQ
  const [faqs, setFaqs] = useState([
    { q: 'How long does SEO take to work?', a: 'Typically noticeable ranking changes occur within 3 to 6 months of continuous optimization.' },
    { q: 'Is technical SEO more important than content?', a: 'Both work together. Technical SEO ensures search engines can crawl your pages, while content satisfies search intent.' },
  ]);

  // Product
  const [prodName, setProdName] = useState('Ergonomic Mechanical Keyboard');
  const [prodDescription, setProdDescription] = useState('Hot-swappable ergonomic mechanical keyboard with tactile switches, aluminum frame, and customizable RGB backlighting.');
  const [prodPrice, setProdPrice] = useState('149.99');
  const [prodSalePrice, setProdSalePrice] = useState('119.99');
  const [prodPriceValidUntil, setProdPriceValidUntil] = useState('2026-12-31');
  const [prodCurrency, setProdCurrency] = useState('USD');
  const [prodBrand, setProdBrand] = useState('TechGear');
  const [prodRating, setProdRating] = useState('4.8');
  const [prodReviewCount, setProdReviewCount] = useState('142');

  // Organization
  const [orgName, setOrgName] = useState('Rankora Intelligence Inc.');
  const [orgUrl, setOrgUrl] = useState('https://rankora.app');
  const [orgLogo, setOrgLogo] = useState('https://rankora.app/logo.png');
  const [orgPhone, setOrgPhone] = useState('+1-800-555-0199');
  const [orgContactType, setOrgContactType] = useState('customer support');
  const [orgSameAs, setOrgSameAs] = useState('https://www.linkedin.com/company/rankora, https://x.com/rankora');

  // Person
  const [personName, setPersonName] = useState('Alex Mercer');
  const [personJobTitle, setPersonJobTitle] = useState('Senior Technical SEO Strategist');
  const [personWorksFor, setPersonWorksFor] = useState('Rankora Intelligence Inc.');
  const [personUrl, setPersonUrl] = useState('https://example.com/author/alex-mercer');
  const [personImage, setPersonImage] = useState('https://example.com/images/alex-mercer.jpg');
  const [personDescription, setPersonDescription] = useState('Technical SEO specialist focusing on crawl architecture, Core Web Vitals, and structured data.');
  const [personSameAs, setPersonSameAs] = useState('https://www.linkedin.com/in/alexmercer, https://x.com/alexmercer');

  // BreadcrumbList
  const [breadcrumbs, setBreadcrumbs] = useState([
    { name: 'Home', url: 'https://example.com' },
    { name: 'Tools', url: 'https://example.com/tools' },
    { name: 'Schema Generator', url: 'https://example.com/tools/schema' },
  ]);

  // HowTo
  const [howtoName, setHowtoName] = useState('How to Conduct a Free SEO Audit');
  const [howtoSteps, setHowtoSteps] = useState([
    { name: 'Enter URL', text: 'Input your live site address into the auditor.' },
    { name: 'Review Issues', text: 'Analyze missing title tags, 404 links, and slow TTFB.' },
    { name: 'Apply Fixes', text: 'Update HTML code and redeploy.' },
  ]);

  // JobPosting
  const [jobTitle, setJobTitle] = useState('Senior Full Stack SEO Engineer');
  const [jobDesc, setJobDesc] = useState('Looking for an engineer experienced in Next.js, React, and automated web crawling architectures.');
  const [jobDatePosted, setJobDatePosted] = useState('2026-03-01');
  const [jobValidThrough, setJobValidThrough] = useState('2026-06-01');
  const [jobEmploymentType, setJobEmploymentType] = useState('FULL_TIME');
  const [jobCompany, setJobCompany] = useState('Rankora Technologies');

  // Recipe
  const [recipeName, setRecipeName] = useState('Artisan Sourdough Bread');
  const [recipeAuthor, setRecipeAuthor] = useState('Chef Maria');
  const [recipePrepTime, setRecipePrepTime] = useState('PT30M');
  const [recipeCookTime, setRecipeCookTime] = useState('PT45M');
  const [recipeYield, setRecipeYield] = useState('1 loaf');
  const [recipeIngredients, setRecipeIngredients] = useState([
    '500g bread flour',
    '350ml warm water',
    '100g active sourdough starter',
    '10g fine sea salt',
  ]);

  // Multi-Product
  const [multiProductFormat, setMultiProductFormat] = useState<'graph' | 'itemlist'>('graph');
  const [multiProductListName, setMultiProductListName] = useState('Featured Product Catalog');
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [multiProducts, setMultiProducts] = useState<MultiProductItem[]>([
    {
      id: 'prod-1',
      name: 'Ergonomic Mechanical Keyboard',
      brand: 'TechGear',
      description: 'Hot-swappable ergonomic mechanical keyboard with tactile switches and aluminum frame.',
      image: 'https://example.com/images/keyboard.jpg',
      url: 'https://example.com/products/mechanical-keyboard',
      price: '149.99',
      salePrice: '119.99',
      priceValidUntil: '2026-12-31',
      currency: 'USD',
      availability: 'https://schema.org/InStock',
      rating: '4.8',
      reviewCount: '142',
    },
    {
      id: 'prod-2',
      name: '4K USB-C Studio Monitor',
      brand: 'ViewPro',
      description: '27-inch IPS 4K UHD display with 99% DCI-P3 color accuracy and 90W USB-C power delivery.',
      image: 'https://example.com/images/monitor.jpg',
      url: 'https://example.com/products/studio-monitor',
      price: '399.00',
      salePrice: '',
      priceValidUntil: '',
      currency: 'USD',
      availability: 'https://schema.org/InStock',
      rating: '4.7',
      reviewCount: '89',
    },
  ]);

  // Multi-Recipe
  const [multiRecipeFormat, setMultiRecipeFormat] = useState<'graph' | 'itemlist'>('graph');
  const [multiRecipeListName, setMultiRecipeListName] = useState('Featured Recipe Collection');
  const [lastAddedRecipeId, setLastAddedRecipeId] = useState<string | null>(null);
  const [multiRecipes, setMultiRecipes] = useState<MultiRecipeItem[]>([
    {
      id: 'rec-1',
      name: 'Artisan Sourdough Bread',
      author: 'Chef Maria',
      description: 'Crisp golden crust with an open, chewy crumb using a slow-fermented sourdough starter.',
      image: 'https://example.com/images/sourdough.jpg',
      url: 'https://example.com/recipes/sourdough-bread',
      prepTime: 'PT30M',
      cookTime: 'PT45M',
      recipeYield: '1 loaf',
      recipeCategory: 'Baking',
      ingredients: [
        '500g bread flour',
        '350ml warm water',
        '100g active sourdough starter',
        '10g fine sea salt',
      ],
      instructions: [
        'Mix flour, warm water, and active starter until combined and rest for 30 minutes.',
        'Add salt, perform coil folds every 30 minutes for 2 hours, and bulk ferment.',
        'Shape the dough and bake in a preheated Dutch oven at 450F for 45 minutes.',
      ],
    },
    {
      id: 'rec-2',
      name: 'Creamy Garlic Tuscan Salmon',
      author: 'Chef Maria',
      description: 'Pan-seared salmon fillets simmered in a garlic, spinach, and sun-dried tomato cream sauce.',
      image: 'https://example.com/images/tuscan-salmon.jpg',
      url: 'https://example.com/recipes/tuscan-salmon',
      prepTime: 'PT15M',
      cookTime: 'PT20M',
      recipeYield: '4 servings',
      recipeCategory: 'Dinner',
      ingredients: [
        '4 salmon fillets',
        '2 tbsp olive oil',
        '4 cloves minced garlic',
        '1 cup heavy cream',
        '2 cups baby spinach',
      ],
      instructions: [
        'Season salmon fillets and sear skin-side down in olive oil for 4 minutes per side.',
        'Saute minced garlic, then pour in heavy cream and simmer until slightly thickened.',
        'Stir in spinach until wilted, return salmon to the pan, and serve warm.',
      ],
    },
  ]);

  // Generate JSON-LD based on active schemaType
  let schemaObj: any = {};

  if (schemaType === 'Article') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: articleHeadline,
      description: articleDesc,
      image: articleImage,
      author: {
        '@type': 'Person',
        name: articleAuthor,
      },
      publisher: {
        '@type': 'Organization',
        name: articlePublisher,
      },
      datePublished: articleDate,
    };
  } else if (schemaType === 'LocalBusiness') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': bizType || 'LocalBusiness',
      name: bizName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: bizAddress,
      },
      telephone: bizPhone,
      url: bizUrl,
    };
  } else if (schemaType === 'FAQPage') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
  } else if (schemaType === 'Product') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: prodName,
      ...(prodDescription.trim() ? { description: prodDescription.trim() } : {}),
      brand: {
        '@type': 'Brand',
        name: prodBrand,
      },
      offers: buildProductOffer({
        price: prodPrice,
        salePrice: prodSalePrice,
        priceValidUntil: prodPriceValidUntil,
        currency: prodCurrency,
        availability: 'https://schema.org/InStock',
      }),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: prodRating,
        reviewCount: prodReviewCount,
      },
    };
  } else if (schemaType === 'Person') {
    const sameAsList = personSameAs
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personName,
      ...(personJobTitle.trim() ? { jobTitle: personJobTitle.trim() } : {}),
      ...(personUrl.trim() ? { url: personUrl.trim() } : {}),
      ...(personImage.trim() ? { image: personImage.trim() } : {}),
      ...(personDescription.trim() ? { description: personDescription.trim() } : {}),
      ...(personWorksFor.trim()
        ? {
            worksFor: {
              '@type': 'Organization',
              name: personWorksFor.trim(),
            },
          }
        : {}),
      ...(sameAsList.length > 0 ? { sameAs: sameAsList } : {}),
    };
  } else if (schemaType === 'Organization') {
    const orgSameAsList = orgSameAs
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: orgUrl,
      logo: orgLogo,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: orgPhone,
        contactType: orgContactType,
      },
      ...(orgSameAsList.length > 0 ? { sameAs: orgSameAsList } : {}),
    };
  } else if (schemaType === 'BreadcrumbList') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url,
      })),
    };
  } else if (schemaType === 'HowTo') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: howtoName,
      step: howtoSteps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.name,
        text: s.text,
      })),
    };
  } else if (schemaType === 'JobPosting') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: jobTitle,
      description: jobDesc,
      datePosted: jobDatePosted,
      validThrough: jobValidThrough,
      employmentType: jobEmploymentType,
      hiringOrganization: {
        '@type': 'Organization',
        name: jobCompany,
      },
    };
  } else if (schemaType === 'Recipe') {
    schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipeName,
      author: {
        '@type': 'Person',
        name: recipeAuthor,
      },
      prepTime: recipePrepTime,
      cookTime: recipeCookTime,
      recipeYield: recipeYield,
      recipeIngredient: recipeIngredients,
    };
  } else if (schemaType === 'MultiProduct') {
    const productNodes = multiProducts.map((p) => ({
      '@type': 'Product',
      name: p.name,
      ...(p.image.trim() ? { image: p.image.trim() } : {}),
      ...(p.description.trim() ? { description: p.description.trim() } : {}),
      ...(p.url.trim() ? { url: p.url.trim() } : {}),
      ...(p.brand.trim()
        ? {
            brand: {
              '@type': 'Brand',
              name: p.brand.trim(),
            },
          }
        : {}),
      offers: buildProductOffer({
        price: p.price,
        salePrice: p.salePrice,
        priceValidUntil: p.priceValidUntil,
        currency: p.currency,
        availability: p.availability,
        url: p.url,
      }),
      ...(p.rating.trim() && p.reviewCount.trim()
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: p.rating.trim(),
              reviewCount: p.reviewCount.trim(),
            },
          }
        : {}),
    }));

    if (multiProductFormat === 'graph') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@graph': productNodes,
      };
    } else {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        ...(multiProductListName.trim() ? { name: multiProductListName.trim() } : {}),
        numberOfItems: productNodes.length,
        itemListElement: productNodes.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item,
        })),
      };
    }
  } else if (schemaType === 'MultiRecipe') {
    const recipeNodes = multiRecipes.map((r) => {
      const cleanedIngredients = r.ingredients.map((ing) => ing.trim()).filter(Boolean);
      const cleanedSteps = r.instructions.map((step) => step.trim()).filter(Boolean);
      return {
        '@type': 'Recipe',
        name: r.name,
        ...(r.image.trim() ? { image: r.image.trim() } : {}),
        ...(r.description.trim() ? { description: r.description.trim() } : {}),
        ...(r.url.trim() ? { url: r.url.trim() } : {}),
        ...(r.author.trim()
          ? {
              author: {
                '@type': 'Person',
                name: r.author.trim(),
              },
            }
          : {}),
        ...(r.prepTime.trim() ? { prepTime: r.prepTime.trim() } : {}),
        ...(r.cookTime.trim() ? { cookTime: r.cookTime.trim() } : {}),
        ...(r.recipeYield.trim() ? { recipeYield: r.recipeYield.trim() } : {}),
        ...(r.recipeCategory.trim() ? { recipeCategory: r.recipeCategory.trim() } : {}),
        recipeIngredient: cleanedIngredients,
        ...(cleanedSteps.length > 0
          ? {
              recipeInstructions: cleanedSteps.map((text, sIdx) => ({
                '@type': 'HowToStep',
                position: sIdx + 1,
                text,
              })),
            }
          : {}),
      };
    });

    if (multiRecipeFormat === 'graph') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@graph': recipeNodes,
      };
    } else {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        ...(multiRecipeListName.trim() ? { name: multiRecipeListName.trim() } : {}),
        numberOfItems: recipeNodes.length,
        itemListElement: recipeNodes.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item,
        })),
      };
    }
  }

  const jsonLdString = JSON.stringify(schemaObj, null, 2);
  const snippet = `<script type="application/ld+json">\n${jsonLdString}\n</script>`;

  const [copiedType, setCopiedType] = useState<'tag' | 'json' | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Real Schema Validator State
  const [activeToolTab, setActiveToolTab] = useState<'generator' | 'validator'>('generator');
  const [validatorInputMode, setValidatorInputMode] = useState<'url' | 'json'>('url');
  const [validatorUrl, setValidatorUrl] = useState('');
  const [validatorJson, setValidatorJson] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    inspectedUrl: string | null;
    totalBlocks: number;
    validCount: number;
    errorCount: number;
    warningCount: number;
    message?: string;
    results: Array<{
      index: number;
      valid: boolean;
      types: string[];
      errors: string[];
      warnings: string[];
      snippet: string;
    }>;
  } | null>(null);

  const runSchemaValidation = async (payload: { url?: string; jsonLd?: string }) => {
    setValidating(true);
    setValidationError(null);
    setValidationResult(null);
    try {
      const res = await fetch('/api/validate-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Schema validation failed');
      setValidationResult(data);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to validate structured data');
    } finally {
      setValidating(false);
    }
  };

  const handleValidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatorInputMode === 'url') {
      let target = validatorUrl.trim();
      if (!target) {
        setValidationError('Please enter a website URL to inspect.');
        return;
      }
      if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
      setValidatorUrl(target);
      await runSchemaValidation({ url: target });
    } else {
      if (!validatorJson.trim()) {
        setValidationError('Please paste JSON-LD markup to validate.');
        return;
      }
      await runSchemaValidation({ jsonLd: validatorJson });
    }
  };

  const handleValidateGenerated = async () => {
    setActiveToolTab('validator');
    setValidatorInputMode('json');
    setValidatorJson(jsonLdString);
    await runSchemaValidation({ jsonLd: jsonLdString });
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      await exportSchemaToPdf(SCHEMA_LABELS[schemaType], schemaObj, snippet);
    } catch (err: any) {
      setPdfError(err?.message || 'Failed to export Schema PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(snippet);
    setCopiedType('tag');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonLdString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema-${schemaType.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold">
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Structured Data Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Schema Markup Generator &amp; Real Validator
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Generate Schema.org JSON-LD tags across 12 schema types (including Multi-Product &amp; Multi-Recipe collections) or validate live URL &amp; JSON-LD structured data against required Google Rich Results properties.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start shrink-0">
            <button
              type="button"
              onClick={() => setActiveToolTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeToolTab === 'generator'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Generator
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab('validator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeToolTab === 'validator'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Live Validator</span>
            </button>
          </div>
        </div>

        {/* Schema Type Selector (only shown in generator mode) */}
        {activeToolTab === 'generator' && (
          <div className="flex flex-wrap gap-2 mt-6">
            {(
              [
                'Article',
                'LocalBusiness',
                'FAQPage',
                'Product',
                'MultiProduct',
                'Person',
                'Organization',
                'BreadcrumbList',
                'HowTo',
                'JobPosting',
                'Recipe',
                'MultiRecipe',
              ] as SchemaType[]
            ).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSchemaType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  schemaType === type
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {SCHEMA_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeToolTab === 'validator' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setValidatorInputMode('url')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  validatorInputMode === 'url'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Inspect Live Website URL</span>
              </button>
              <button
                type="button"
                onClick={() => setValidatorInputMode('json')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  validatorInputMode === 'json'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Paste JSON-LD Snippet</span>
              </button>
            </div>

            <form onSubmit={handleValidateSubmit} className="space-y-4">
              {validatorInputMode === 'url' ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={validatorUrl}
                    onChange={(e) => setValidatorUrl(e.target.value)}
                    disabled={validating}
                    placeholder="https://example.com/article"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={validating || !validatorUrl.trim()}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0"
                  >
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{validating ? 'Inspecting...' : 'Validate Live Page'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={10}
                    value={validatorJson}
                    onChange={(e) => setValidatorJson(e.target.value)}
                    disabled={validating}
                    placeholder='{"@context": "https://schema.org", "@type": "Article", "headline": "..."}'
                    className="w-full p-4 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={validating || !validatorJson.trim()}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm flex items-center gap-2"
                  >
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{validating ? 'Validating...' : 'Run Schema Validation'}</span>
                  </button>
                </div>
              )}
            </form>

            {validationError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {validationResult && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Validation Results ({validationResult.totalBlocks} JSON-LD block{validationResult.totalBlocks === 1 ? '' : 's'})
                  </h2>
                  {validationResult.inspectedUrl && (
                    <p className="text-xs font-mono text-slate-500 mt-0.5 break-all">
                      Inspected URL: {validationResult.inspectedUrl}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {validationResult.validCount} Valid
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    {validationResult.errorCount} Errors
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {validationResult.warningCount} Warnings
                  </span>
                </div>
              </div>

              {validationResult.message && validationResult.results.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-300">
                  {validationResult.message}
                </div>
              ) : (
                <div className="space-y-4">
                  {validationResult.results.map((block) => (
                    <div
                      key={block.index}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        block.valid
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                          : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Block #{block.index}
                          </span>
                          {block.types.map((t, ti) => (
                            <span
                              key={ti}
                              className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-mono text-[11px] font-bold"
                            >
                              @type: {t}
                            </span>
                          ))}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            block.valid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {block.valid ? 'VALID SCHEMA' : 'ERRORS FOUND'}
                        </span>
                      </div>

                      {block.errors.length > 0 && (
                        <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                          {block.errors.map((errMsg, ei) => (
                            <li key={ei} className="flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{errMsg}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {block.warnings.length > 0 && (
                        <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                          {block.warnings.map((warnMsg, wi) => (
                            <li key={wi} className="flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{warnMsg}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {block.errors.length === 0 && block.warnings.length === 0 && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          All inspected Schema.org syntax &amp; Google Rich Results required/recommended properties passed.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
      /* Editor & Preview Split View */
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Configure {SCHEMA_LABELS[schemaType]} Properties
          </h2>

          {schemaType === 'Article' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Core Content"
                subtitle="Headline and summary description"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Headline / Article Title
                  </label>
                  <input
                    type="text"
                    value={articleHeadline}
                    onChange={(e) => setArticleHeadline(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Article Description
                  </label>
                  <textarea
                    rows={2}
                    value={articleDesc}
                    onChange={(e) => setArticleDesc(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Author & Publishing"
                subtitle="Author, publisher, and publish date"
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={articleAuthor}
                      onChange={(e) => setArticleAuthor(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Publisher Name
                    </label>
                    <input
                      type="text"
                      value={articlePublisher}
                      onChange={(e) => setArticlePublisher(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Date Published
                  </label>
                  <input
                    type="date"
                    value={articleDate}
                    onChange={(e) => setArticleDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Featured Media"
                subtitle="Article cover image URL"
                badge="Recommended"
                defaultOpen={false}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={articleImage}
                    onChange={(e) => setArticleImage(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'LocalBusiness' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Business Identity"
                subtitle="Name and Schema.org business category"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Business @type
                  </label>
                  <input
                    type="text"
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value)}
                    placeholder="LocalBusiness, ProfessionalService, Restaurant..."
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Location & Contact Information"
                subtitle="Physical address, phone number, and website"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Telephone
                    </label>
                    <input
                      type="text"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={bizUrl}
                      onChange={(e) => setBizUrl(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'FAQPage' && (
            <div className="space-y-4 text-xs">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Question #{i + 1}</span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[i].q = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[i].a = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { q: 'New Question?', a: 'Answer text...' }])}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ Item</span>
              </button>
            </div>
          )}

          {schemaType === 'Product' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Product Details"
                subtitle="Title, brand, and optional product description"
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Product Title
                    </label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Product Description <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Describe the product features, specifications, and benefits..."
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Offer & Aggregate Rating"
                subtitle="Price, currency, and customer review score"
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Regular Price ({prodCurrency})
                    </label>
                    <input
                      type="text"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Sale Price ({prodCurrency}) <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={prodSalePrice}
                      onChange={(e) => setProdSalePrice(e.target.value)}
                      placeholder="Leave blank if not on sale"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={prodCurrency}
                      onChange={(e) => setProdCurrency(e.target.value.toUpperCase())}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Sale Valid Until <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={prodPriceValidUntil}
                      onChange={(e) => setProdPriceValidUntil(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Rating (1–5)
                    </label>
                    <input
                      type="text"
                      value={prodRating}
                      onChange={(e) => setProdRating(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Review Count
                    </label>
                    <input
                      type="text"
                      value={prodReviewCount}
                      onChange={(e) => setProdReviewCount(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'Person' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Identity & Role"
                subtitle="Full name, job title, and employer organization"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={personJobTitle}
                      onChange={(e) => setPersonJobTitle(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Works For (Organization)
                    </label>
                    <input
                      type="text"
                      value={personWorksFor}
                      onChange={(e) => setPersonWorksFor(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Profile URL, Photo & Bio"
                subtitle="Author page URL, portrait image, and description"
                defaultOpen={false}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Profile / Author Page URL
                  </label>
                  <input
                    type="text"
                    value={personUrl}
                    onChange={(e) => setPersonUrl(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Portrait / Image URL <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={personImage}
                    onChange={(e) => setPersonImage(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Bio / Description <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={personDescription}
                    onChange={(e) => setPersonDescription(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Social Profiles"
                subtitle="LinkedIn, X/Twitter, and authoritative sameAs links"
                badge="E-E-A-T"
                defaultOpen={false}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Social Profiles (sameAs — comma or newline separated)
                  </label>
                  <textarea
                    rows={2}
                    value={personSameAs}
                    onChange={(e) => setPersonSameAs(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username, https://x.com/username"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'Organization' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Organization Identity"
                subtitle="Brand name, official website, and logo URL"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="text"
                    value={orgUrl}
                    onChange={(e) => setOrgUrl(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Contact Information"
                subtitle="Customer support phone and contactPoint type"
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Contact Type
                    </label>
                    <input
                      type="text"
                      value={orgContactType}
                      onChange={(e) => setOrgContactType(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Social Profiles"
                subtitle="Official company profiles (sameAs URLs)"
                badge="Recommended"
                defaultOpen={false}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Social Profiles (sameAs — comma or newline separated)
                  </label>
                  <textarea
                    rows={2}
                    value={orgSameAs}
                    onChange={(e) => setOrgSameAs(e.target.value)}
                    placeholder="https://www.linkedin.com/company/yourbrand, https://x.com/yourbrand"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'BreadcrumbList' && (
            <div className="space-y-4 text-xs">
              <label className="font-bold text-slate-600 dark:text-slate-400 block">
                Breadcrumb Trail Items
              </label>
              {breadcrumbs.map((bc, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">Level #{i + 1}</span>
                    {breadcrumbs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBreadcrumbs(breadcrumbs.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Page Name (e.g. Blog)"
                    value={bc.name}
                    onChange={(e) => {
                      const updated = [...breadcrumbs];
                      updated[i].name = e.target.value;
                      setBreadcrumbs(updated);
                    }}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Page URL (e.g. https://example.com/blog)"
                    value={bc.url}
                    onChange={(e) => {
                      const updated = [...breadcrumbs];
                      updated[i].url = e.target.value;
                      setBreadcrumbs(updated);
                    }}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setBreadcrumbs([...breadcrumbs, { name: 'New Page', url: 'https://example.com/page' }])}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Breadcrumb Item</span>
              </button>
            </div>
          )}

          {schemaType === 'HowTo' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Guide Overview"
                subtitle="Main HowTo title"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    HowTo Guide Title
                  </label>
                  <input
                    type="text"
                    value={howtoName}
                    onChange={(e) => setHowtoName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Step-by-Step Instructions"
                subtitle="Ordered HowToStep items"
                badge={`${howtoSteps.length} steps`}
                defaultOpen={true}
              >
                {howtoSteps.map((step, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">Step #{i + 1}</span>
                      {howtoSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHowtoSteps(howtoSteps.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Step Title"
                      value={step.name}
                      onChange={(e) => {
                        const updated = [...howtoSteps];
                        updated[i].name = e.target.value;
                        setHowtoSteps(updated);
                      }}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Step Instructions"
                      value={step.text}
                      onChange={(e) => {
                        const updated = [...howtoSteps];
                        updated[i].text = e.target.value;
                        setHowtoSteps(updated);
                      }}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHowtoSteps([...howtoSteps, { name: 'Next Step', text: 'Describe step action...' }])}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add HowTo Step</span>
                </button>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'JobPosting' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Role Overview"
                subtitle="Job title and position summary"
                defaultOpen={true}
              >
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Job Position Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Job Description
                  </label>
                  <textarea
                    rows={2}
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Hiring Organization & Employment"
                subtitle="Company name and employment type"
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Employment Type
                    </label>
                    <select
                      value={jobEmploymentType}
                      onChange={(e) => setJobEmploymentType(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACTOR">Contractor</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Posting Schedule"
                subtitle="Publication and application expiration dates"
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Date Posted
                    </label>
                    <input
                      type="date"
                      value={jobDatePosted}
                      onChange={(e) => setJobDatePosted(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Valid Through
                    </label>
                    <input
                      type="date"
                      value={jobValidThrough}
                      onChange={(e) => setJobValidThrough(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'Recipe' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Recipe Overview"
                subtitle="Dish name and chef / author attribution"
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Author / Chef
                    </label>
                    <input
                      type="text"
                      value={recipeAuthor}
                      onChange={(e) => setRecipeAuthor(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Timing & Yield"
                subtitle="ISO 8601 prep/cook durations and servings"
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Prep Time
                    </label>
                    <input
                      type="text"
                      value={recipePrepTime}
                      onChange={(e) => setRecipePrepTime(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Cook Time
                    </label>
                    <input
                      type="text"
                      value={recipeCookTime}
                      onChange={(e) => setRecipeCookTime(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Yield
                    </label>
                    <input
                      type="text"
                      value={recipeYield}
                      onChange={(e) => setRecipeYield(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Ingredients List"
                subtitle="Structured recipeIngredient items"
                badge={`${recipeIngredients.length} items`}
                defaultOpen={true}
              >
                {recipeIngredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => {
                        const updated = [...recipeIngredients];
                        updated[i] = e.target.value;
                        setRecipeIngredients(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    {recipeIngredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRecipeIngredients(recipeIngredients.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRecipeIngredients([...recipeIngredients, 'New Ingredient'])}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Ingredient</span>
                </button>
              </CollapsibleSection>
            </div>
          )}

          {schemaType === 'MultiProduct' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Output Structure"
                subtitle="Choose between @graph multi-entity array or ItemList carousel"
                badge={multiProductFormat === 'graph' ? '@graph' : 'ItemList'}
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMultiProductFormat('graph')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      multiProductFormat === 'graph'
                        ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">JSON-LD @graph</div>
                    <div className="text-[11px] opacity-80">Independent Product entities in one script</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiProductFormat('itemlist')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      multiProductFormat === 'itemlist'
                        ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">ItemList Carousel</div>
                    <div className="text-[11px] opacity-80">Ordered catalog / category list markup</div>
                  </button>
                </div>
                {multiProductFormat === 'itemlist' && (
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Catalog / Collection Name
                    </label>
                    <input
                      type="text"
                      value={multiProductListName}
                      onChange={(e) => setMultiProductListName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </CollapsibleSection>

              {multiProducts.map((prod, idx) => (
                <CollapsibleSection
                  key={prod.id}
                  title={`Product #${idx + 1}: ${prod.name || 'Untitled Product'}`}
                  subtitle={`${prod.brand || 'No brand'} • ${
                    prod.salePrice.trim()
                      ? `${prod.currency} ${prod.salePrice} (was ${prod.price || '0.00'})`
                      : `${prod.currency} ${prod.price || '0.00'}`
                  }`}
                  badge={
                    prod.salePrice.trim()
                      ? `Sale ${prod.currency} ${prod.salePrice}`
                      : prod.price
                      ? `${prod.currency} ${prod.price}`
                      : undefined
                  }
                  defaultOpen={idx === 0 || prod.id === lastAddedProductId}
                >
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        const duplicated: MultiProductItem = {
                          ...prod,
                          id: newId,
                          name: prod.name.trim() ? `${prod.name} (Copy)` : `Product #${multiProducts.length + 1}`,
                        };
                        setLastAddedProductId(newId);
                        setMultiProducts([
                          ...multiProducts.slice(0, idx + 1),
                          duplicated,
                          ...multiProducts.slice(idx + 1),
                        ]);
                      }}
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-bold text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate Product</span>
                    </button>
                    {multiProducts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMultiProducts(multiProducts.filter((item) => item.id !== prod.id))}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Product</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, name: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={prod.brand}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, brand: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Description <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={prod.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, description: val } : item)));
                      }}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={prod.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, image: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Product Page URL
                      </label>
                      <input
                        type="text"
                        value={prod.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, url: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Regular Price
                      </label>
                      <input
                        type="text"
                        value={prod.price}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, price: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Sale Price <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={prod.salePrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, salePrice: val } : item)));
                        }}
                        placeholder="Not on sale"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={prod.currency}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, currency: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Sale Valid Until <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={prod.priceValidUntil}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, priceValidUntil: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Availability
                      </label>
                      <select
                        value={prod.availability}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, availability: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      >
                        <option value="https://schema.org/InStock">In Stock</option>
                        <option value="https://schema.org/OutOfStock">Out of Stock</option>
                        <option value="https://schema.org/PreOrder">Pre-Order</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Rating (1–5) <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={prod.rating}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, rating: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Review Count <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={prod.reviewCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiProducts(multiProducts.map((item) => (item.id === prod.id ? { ...item, reviewCount: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newId = `prod-${Date.now()}`;
                  setLastAddedProductId(newId);
                  setMultiProducts([
                    ...multiProducts,
                    {
                      id: newId,
                      name: `Product #${multiProducts.length + 1}`,
                      brand: 'BrandName',
                      description: '',
                      image: 'https://example.com/images/product.jpg',
                      url: 'https://example.com/products/item',
                      price: '49.99',
                      salePrice: '',
                      priceValidUntil: '',
                      currency: 'USD',
                      availability: 'https://schema.org/InStock',
                      rating: '4.5',
                      reviewCount: '25',
                    },
                  ]);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold text-xs hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product ({multiProducts.length} total)</span>
              </button>
            </div>
          )}

          {schemaType === 'MultiRecipe' && (
            <div className="space-y-3">
              <CollapsibleSection
                title="Output Structure"
                subtitle="Choose between @graph multi-entity array or ItemList carousel"
                badge={multiRecipeFormat === 'graph' ? '@graph' : 'ItemList'}
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMultiRecipeFormat('graph')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      multiRecipeFormat === 'graph'
                        ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">JSON-LD @graph</div>
                    <div className="text-[11px] opacity-80">Independent Recipe entities in one script</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiRecipeFormat('itemlist')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      multiRecipeFormat === 'itemlist'
                        ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">ItemList Carousel</div>
                    <div className="text-[11px] opacity-80">Ordered recipe roundup / carousel list</div>
                  </button>
                </div>
                {multiRecipeFormat === 'itemlist' && (
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Collection / Roundup Title
                    </label>
                    <input
                      type="text"
                      value={multiRecipeListName}
                      onChange={(e) => setMultiRecipeListName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </CollapsibleSection>

              {multiRecipes.map((rec, idx) => (
                <CollapsibleSection
                  key={rec.id}
                  title={`Recipe #${idx + 1}: ${rec.name || 'Untitled Recipe'}`}
                  subtitle={`${rec.author || 'No author'} • ${rec.recipeYield || 'Yield unset'}`}
                  badge={`${rec.ingredients.length} ing`}
                  defaultOpen={idx === 0 || rec.id === lastAddedRecipeId}
                >
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        const duplicated: MultiRecipeItem = {
                          ...rec,
                          id: newId,
                          name: rec.name.trim() ? `${rec.name} (Copy)` : `Recipe #${multiRecipes.length + 1}`,
                          ingredients: [...rec.ingredients],
                          instructions: [...rec.instructions],
                        };
                        setLastAddedRecipeId(newId);
                        setMultiRecipes([
                          ...multiRecipes.slice(0, idx + 1),
                          duplicated,
                          ...multiRecipes.slice(idx + 1),
                        ]);
                      }}
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-bold text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate Recipe</span>
                    </button>
                    {multiRecipes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMultiRecipes(multiRecipes.filter((item) => item.id !== rec.id))}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Recipe</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Recipe Name
                      </label>
                      <input
                        type="text"
                        value={rec.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, name: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Author / Chef
                      </label>
                      <input
                        type="text"
                        value={rec.author}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, author: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Description <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={rec.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, description: val } : item)));
                      }}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={rec.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, image: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Recipe Page URL <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={rec.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, url: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Prep Time
                      </label>
                      <input
                        type="text"
                        value={rec.prepTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, prepTime: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Cook Time
                      </label>
                      <input
                        type="text"
                        value={rec.cookTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, cookTime: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Yield
                      </label>
                      <input
                        type="text"
                        value={rec.recipeYield}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, recipeYield: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={rec.recipeCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiRecipes(multiRecipes.map((item) => (item.id === rec.id ? { ...item, recipeCategory: val } : item)));
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-2 pt-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">
                      Ingredients
                    </label>
                    {rec.ingredients.map((ing, ingIdx) => (
                      <div key={ingIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ing}
                          onChange={(e) => {
                            const updatedIngs = [...rec.ingredients];
                            updatedIngs[ingIdx] = e.target.value;
                            setMultiRecipes(
                              multiRecipes.map((item) => (item.id === rec.id ? { ...item, ingredients: updatedIngs } : item))
                            );
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                        {rec.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedIngs = rec.ingredients.filter((_, i) => i !== ingIdx);
                              setMultiRecipes(
                                multiRecipes.map((item) => (item.id === rec.id ? { ...item, ingredients: updatedIngs } : item))
                              );
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMultiRecipes(
                          multiRecipes.map((item) =>
                            item.id === rec.id ? { ...item, ingredients: [...item.ingredients, 'New Ingredient'] } : item
                          )
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Ingredient</span>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 pt-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">
                      Preparation Steps (HowToStep)
                    </label>
                    {rec.instructions.map((stepText, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-2">
                        <span className="mt-2 text-[11px] font-bold text-slate-400 w-5 shrink-0">
                          {stepIdx + 1}.
                        </span>
                        <textarea
                          rows={2}
                          value={stepText}
                          onChange={(e) => {
                            const updatedSteps = [...rec.instructions];
                            updatedSteps[stepIdx] = e.target.value;
                            setMultiRecipes(
                              multiRecipes.map((item) => (item.id === rec.id ? { ...item, instructions: updatedSteps } : item))
                            );
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                        {rec.instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSteps = rec.instructions.filter((_, i) => i !== stepIdx);
                              setMultiRecipes(
                                multiRecipes.map((item) => (item.id === rec.id ? { ...item, instructions: updatedSteps } : item))
                              );
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMultiRecipes(
                          multiRecipes.map((item) =>
                            item.id === rec.id ? { ...item, instructions: [...item.instructions, 'Describe next cooking step...'] } : item
                          )
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/40 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>
                </CollapsibleSection>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newId = `rec-${Date.now()}`;
                  setLastAddedRecipeId(newId);
                  setMultiRecipes([
                    ...multiRecipes,
                    {
                      id: newId,
                      name: `Recipe #${multiRecipes.length + 1}`,
                      author: 'Chef Name',
                      description: '',
                      image: 'https://example.com/images/recipe.jpg',
                      url: 'https://example.com/recipes/dish',
                      prepTime: 'PT15M',
                      cookTime: 'PT30M',
                      recipeYield: '2 servings',
                      recipeCategory: 'Main Course',
                      ingredients: ['1 cup main ingredient'],
                      instructions: ['Prepare ingredients and cook according to recipe directions.'],
                    },
                  ]);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-violet-600 dark:text-violet-400 font-bold text-xs hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Recipe ({multiRecipes.length} total)</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Code Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-violet-500" />
                <span>JSON-LD Output (Ready to Embed)</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                  title="Export styled PDF document"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyTag}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Copy full HTML <script> tag"
                >
                  {copiedType === 'tag' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedType === 'tag' ? 'Copied HTML Tag!' : 'Copy Script Tag'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Copy raw JSON-LD object text"
                >
                  {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedType === 'json' ? 'Copied Raw JSON!' : 'Copy Raw JSON'}</span>
                </button>
              <button
                  type="button"
                  onClick={handleValidateGenerated}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Validate this JSON-LD with the server validator"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validate</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                  title="Download .json file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            {pdfError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">{pdfError}</p>
            )}

            <div className="relative group mt-4">
              <button
                type="button"
                onClick={handleCopyTag}
                className="absolute top-3 right-3 opacity-90 sm:opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all border border-slate-700 shadow-md"
              >
                {copiedType === 'tag' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'tag' ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[420px] border border-slate-800 leading-relaxed select-all">
                <code>{snippet}</code>
              </pre>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Schema.org JSON-LD ready to embed — click Validate to run real syntax &amp; Rich Results checks.</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
