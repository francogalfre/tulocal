import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const AGENT_NAME_MAX_LENGTH = 30;

type AgentFieldsProps = {
  agentName: string;
};

export function AgentFields({ agentName }: AgentFieldsProps) {
  return (
    <FieldSet>
      <FieldLegend>Tu vendedor</FieldLegend>
      <FieldDescription>
        Atiende el chat de cada producto, negocia y te avisa cuando hay un comprador en serio.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="agentName">Nombre</FieldLabel>
          <Input
            id="agentName"
            name="agentName"
            className="h-11"
            maxLength={AGENT_NAME_MAX_LENGTH}
            defaultValue={agentName}
            required
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
