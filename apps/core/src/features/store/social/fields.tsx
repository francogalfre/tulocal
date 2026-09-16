import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SOCIAL_NETWORKS } from "@/features/store/social/networks";
import type { SocialHandles } from "@/features/store/social/networks";

type SocialFieldsProps = {
  handles: SocialHandles;
};

export function SocialFields({ handles }: SocialFieldsProps) {
  return (
    <FieldSet>
      <FieldLegend>Redes</FieldLegend>
      <FieldDescription>Escribí el usuario o pegá el link a tu perfil.</FieldDescription>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        {SOCIAL_NETWORKS.map((network) => (
          <Field key={network.key}>
            <FieldLabel htmlFor={network.key}>{network.name}</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon>
                <network.Logo className={network.logoClassName} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={network.key}
                name={network.key}
                placeholder={network.placeholder}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                defaultValue={handles[network.key] ?? ""}
              />
            </InputGroup>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}
