import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
interface TooltipComponentProps {
  text: string;
  icon: LucideIcon;
}
export function TooltipComponent({ text, icon: Icon }: TooltipComponentProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon className="w-5 h-5 shrink-0" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-lexend whitespace-pre-line p-2">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
