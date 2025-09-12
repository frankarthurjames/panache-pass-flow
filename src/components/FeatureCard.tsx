import { CheckCircle } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  imagePosition?: 'left' | 'right';
}

export const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  features, 
  imagePosition = 'right' 
}: FeatureCardProps) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-16 items-center mb-20 ${
      imagePosition === 'left' ? 'lg:grid-cols-2' : ''
    }`}>
      <div className={imagePosition === 'left' ? 'order-2 lg:order-1' : ''}>
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl" />
      </div>
      <div className={imagePosition === 'left' ? 'order-1 lg:order-2' : ''}>
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};