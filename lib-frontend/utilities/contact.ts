import * as m from '$i18n/output/messages';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItemSingle } from '$lib/utilities/select';

interface ContactCategorySelect<T> extends SelectItemSingle<T> {
	notice: string;
}

export function contactCategorySelect(
	languageTag: AvailableLanguageTags
): ContactCategorySelect<string>[] {
	return [
		{
			value: 'shortbook-help',
			label: m.contact_category_help_label({ languageTag }),
			notice: m.contact_category_help_notice({ languageTag })
		},
		{
			value: 'shortbook-violation',
			label: m.contact_category_violation_label({ languageTag }),
			notice: m.contact_category_violation_notice({ languageTag })
		},
		{
			value: 'shortbook-copyright',
			label: m.contact_category_copyright_label({ languageTag }),
			notice: m.contact_category_copyright_notice({ languageTag })
		},
		{
			value: 'shortbook-bug',
			label: m.contact_category_bug_label({ languageTag }),
			notice: m.contact_category_bug_notice({ languageTag })
		},
		{
			value: 'shortbook-feature',
			label: m.contact_category_feature_label({ languageTag }),
			notice: m.contact_category_feature_notice({ languageTag })
		},
		{
			value: 'shortbook-translation',
			label: m.contact_category_translation_label({ languageTag }),
			notice: m.contact_category_translation_notice({ languageTag })
		},
		{
			value: 'shortbook-security',
			label: m.contact_category_security_label({ languageTag }),
			notice: m.contact_category_security_notice({ languageTag })
		},
		{
			value: 'shortbook-policy',
			label: m.contact_category_policy_label({ languageTag }),
			notice: m.contact_category_policy_notice({ languageTag })
		},
		{
			value: 'company-about',
			label: m.contact_category_company_label({ languageTag }),
			notice: m.contact_category_company_notice({ languageTag })
		},
		{
			value: 'company-recruit',
			label: m.contact_category_recruit_label({ languageTag }),
			notice: m.contact_category_recruit_notice({ languageTag })
		},
		{
			value: 'company-press',
			label: m.contact_category_press_label({ languageTag }),
			notice: m.contact_category_press_notice({ languageTag })
		},
		{
			value: 'life-need-help',
			label: m.contact_category_life_label({ languageTag }),
			notice: m.contact_category_life_notice({ languageTag })
		},
		{
			value: 'other',
			label: m.contact_category_other_label({ languageTag }),
			notice: ''
		}
	];
}

export function contactCategoryAndNoSelect(
	languageTag: AvailableLanguageTags
): ContactCategorySelect<string>[] {
	return [
		{ value: '', label: 'Select category', notice: '' },
		...contactCategorySelect(languageTag)
	];
}
