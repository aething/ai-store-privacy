import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowDownAZ,
  ArrowDownZA,
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

interface ProductSortProps {
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export default function ProductSort({ 
  onSort, 
  defaultSortBy = 'price', 
  defaultSortOrder = 'asc' 
}: ProductSortProps) {
  const { t } = useLocale();
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  useEffect(() => {
    onSort(sortBy, sortOrder);
  }, [sortBy, sortOrder, onSort]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? <ArrowDown01 className="h-4 w-4" /> : <ArrowDown10 className="h-4 w-4" />;
    } else if (sortBy === 'title') {
      return sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowDownZA className="h-4 w-4" />;
    } else {
      return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex-1 text-sm font-medium">
        {t('sort_by')}:
      </div>
      <Select 
        value={sortBy} 
        onValueChange={(value) => setSortBy(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('sort_by')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price">{t('price')}</SelectItem>
          <SelectItem value="title">{t('name')}</SelectItem>
          <SelectItem value="category">{t('category')}</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="icon"
        onClick={toggleSortOrder}
        title={sortOrder === 'asc' ? t('ascending') : t('descending')}
      >
        {getSortIcon()}
      </Button>
    </div>
  );
}