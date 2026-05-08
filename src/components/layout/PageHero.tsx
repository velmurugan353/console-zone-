import { motion } from "framer-motion";
import { EditableText, EditableImage } from "../Editable";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  images?: string[];
  height?: string;
  pageKey?: string;
}

export default function PageHero({ title, subtitle, images = [], height = "60vh", pageKey = "hero" }: PageHeroProps) {
  const bgImage = images.length > 0 ? images[0] : "https://picsum.photos/seed/gaming/1920/1080?blur=4";

  return (
    <div 
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ height }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <EditableImage 
          pageKey={pageKey}
          itemKey="hero_image"
          defaultSrc={bgImage}
          alt={title}
          className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080112] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase italic">
          <EditableText pageKey={pageKey} itemKey="hero_title" defaultText={title} />
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl font-bold text-gaming-accent tracking-widest uppercase">
            <EditableText pageKey={pageKey} itemKey="hero_subtitle" defaultText={subtitle} />
          </p>
        )}
      </motion.div>
    </div>
  );
}

