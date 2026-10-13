import siteIt from './it/site.json';
import assessmentIt from './it/assessment.json';
import servicesIt from './it/services.json';
import proposalsIt from './it/proposals.json';
import metricsIt from './it/metrics.json';
import uiIt from './it/ui.json';
import siteEn from './en/site.json';
import assessmentEn from './en/assessment.json';
import servicesEn from './en/services.json';
import proposalsEn from './en/proposals.json';
import metricsEn from './en/metrics.json';
import uiEn from './en/ui.json';

/**
 * All the copy of the site, one folder per language (same shape in each).
 * To add a language: copy src/data/it to a new folder, translate the values, register it here
 * and add its HTML pages (see README).
 */
export const LANGUAGES = ['it', 'en'];
export const DEFAULT_LANGUAGE = 'it';

const CONTENT = {
  it: { site: siteIt, assessment: assessmentIt, services: servicesIt, proposals: proposalsIt, metrics: metricsIt, ui: uiIt },
  en: { site: siteEn, assessment: assessmentEn, services: servicesEn, proposals: proposalsEn, metrics: metricsEn, ui: uiEn },
};

export function getContent(lang) {
  return CONTENT[lang] ?? CONTENT[DEFAULT_LANGUAGE];
}
