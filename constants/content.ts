export interface SiteContentItem {
  id_app: string;
  component: string;
  section: string;
  key: string;
  value: string;
}

export const SITE_CONTENT: SiteContentItem[] = [
  // NAVBAR
  {
    id_app: 'OA-NAV-001',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_brand_title',
    value: 'Centro Pro',
  },
  {
    id_app: 'OA-NAV-002',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_brand_badge',
    value: 'Oficial',
  },
  {
    id_app: 'OA-NAV-003',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_link_inicio',
    value: 'Inicio',
  },
  {
    id_app: 'OA-NAV-004',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_link_planes',
    value: 'Planes & Costos',
  },
  {
    id_app: 'OA-NAV-005',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_link_instalaciones',
    value: 'Instalaciones',
  },
  {
    id_app: 'OA-NAV-006',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_link_metodo',
    value: 'Metodología',
  },
  {
    id_app: 'OA-NAV-007',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_link_contacto',
    value: 'Horarios & Sede',
  },
  {
    id_app: 'OA-NAV-008',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_btn_client_access',
    value: 'Acceso Socios',
  },
  {
    id_app: 'OA-NAV-009',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_btn_client_access_short',
    value: 'Socios',
  },
  {
    id_app: 'OA-NAV-010',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_btn_admin_private',
    value: 'Staff Privado',
  },
  {
    id_app: 'OA-NAV-011',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_mobile_portal_text',
    value: 'Portal de Socios (QR / Cédula)',
  },
  {
    id_app: 'OA-NAV-012',
    component: 'Navbar',
    section: 'navbar',
    key: 'nav_mobile_admin_text',
    value: 'Ruta Privada Administrador (Staff)',
  },

  // HERO SECTION
  {
    id_app: 'OA-HERO-001',
    component: 'Hero',
    section: 'hero',
    key: 'hero_badge_text',
    value: 'CENTRO DE ALTO RENDIMIENTO & FITNESS TÉCNICO',
  },
  {
    id_app: 'OA-HERO-002',
    component: 'Hero',
    section: 'hero',
    key: 'hero_cta_planes',
    value: 'Explorar Planes & Costos',
  },
  {
    id_app: 'OA-HERO-003',
    component: 'Hero',
    section: 'hero',
    key: 'hero_cta_portal',
    value: 'Acceder con QR o Cédula',
  },
  {
    id_app: 'OA-HERO-004',
    component: 'Hero',
    section: 'hero',
    key: 'hero_cta_trial_label',
    value: '¿Primera vez? Solicita 1 Día de Cortesía',
  },
  {
    id_app: 'OA-HERO-005',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_1_title',
    value: 'Biomecánica Pesada',
  },
  {
    id_app: 'OA-HERO-006',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_1_desc',
    value: 'Palancas guiadas y plataformas olímpicas',
  },
  {
    id_app: 'OA-HERO-007',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_2_title',
    value: 'Control Antropométrico',
  },
  {
    id_app: 'OA-HERO-008',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_2_desc',
    value: 'Bioimpedancia y pliegues periódicos',
  },
  {
    id_app: 'OA-HERO-009',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_3_title',
    value: 'Carnet QR & App',
  },
  {
    id_app: 'OA-HERO-010',
    component: 'Hero',
    section: 'hero',
    key: 'hero_pillar_3_desc',
    value: 'Acceso por torniquete y rutina en línea',
  },

  // FOOTER SECTION
  {
    id_app: 'OA-FOOT-001',
    component: 'Footer',
    section: 'footer',
    key: 'footer_badge_subtitle',
    value: 'Centro de Alto Rendimiento',
  },
  {
    id_app: 'OA-FOOT-002',
    component: 'Footer',
    section: 'footer',
    key: 'footer_certification_badge',
    value: 'Instalaciones habilitadas y certificadas con protocolo biomédico.',
  },
  {
    id_app: 'OA-FOOT-003',
    component: 'Footer',
    section: 'footer',
    key: 'footer_schedule_title',
    value: 'Horarios de Apertura',
  },
  {
    id_app: 'OA-FOOT-004',
    component: 'Footer',
    section: 'footer',
    key: 'footer_schedule_weekdays_label',
    value: 'Lunes a Viernes',
  },
  {
    id_app: 'OA-FOOT-005',
    component: 'Footer',
    section: 'footer',
    key: 'footer_contact_title',
    value: 'Sede Principal & Contacto',
  },
  {
    id_app: 'OA-FOOT-006',
    component: 'Footer',
    section: 'footer',
    key: 'footer_whatsapp_button',
    value: 'Atención WhatsApp Recepción',
  },
  {
    id_app: 'OA-FOOT-007',
    component: 'Footer',
    section: 'footer',
    key: 'footer_shortcuts_title',
    value: 'Accesos Directos',
  },
  {
    id_app: 'OA-FOOT-008',
    component: 'Footer',
    section: 'footer',
    key: 'footer_client_portal_title',
    value: 'Área Personal de Socios',
  },
  {
    id_app: 'OA-FOOT-009',
    component: 'Footer',
    section: 'footer',
    key: 'footer_client_portal_desc',
    value: 'Ingreso por Cédula o Carnet QR',
  },
  {
    id_app: 'OA-FOOT-010',
    component: 'Footer',
    section: 'footer',
    key: 'footer_staff_access_label',
    value: 'Ruta Privada Staff (Admin)',
  },
  {
    id_app: 'OA-FOOT-011',
    component: 'Footer',
    section: 'footer',
    key: 'footer_staff_access_badge',
    value: 'QR + PIN',
  },
  {
    id_app: 'OA-FOOT-012',
    component: 'Footer',
    section: 'footer',
    key: 'footer_copyright_suffix',
    value: 'OA GYM • Todos los derechos reservados. Sistema Integral de Gestión Deportiva.',
  },
  {
    id_app: 'OA-FOOT-013',
    component: 'Footer',
    section: 'footer',
    key: 'footer_tech_specs',
    value: 'Desarrollo Next.js 16.3.5 • Dark Mode Nativo',
  },

  // CLIENT PORTAL MODAL
  {
    id_app: 'OA-PORTAL-001',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_modal_title',
    value: 'Portal de Socios OA GYM',
  },
  {
    id_app: 'OA-PORTAL-002',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_modal_subtitle',
    value: 'Ingresa a tu carnet digital oficial, rutina prescrita y seguimiento de cargas.',
  },
  {
    id_app: 'OA-PORTAL-003',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_tab_biometric',
    value: 'Huella / Face ID',
  },
  {
    id_app: 'OA-PORTAL-004',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_tab_cedula',
    value: 'Por Cédula',
  },
  {
    id_app: 'OA-PORTAL-005',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_tab_qr',
    value: 'Escanear QR',
  },
  {
    id_app: 'OA-PORTAL-006',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_label_cedula',
    value: 'Número de Cédula o Identificación',
  },
  {
    id_app: 'OA-PORTAL-007',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_placeholder_cedula',
    value: 'Ej: 1020304050 (sin puntos ni guiones)',
  },
  {
    id_app: 'OA-PORTAL-008',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_hint_cedula',
    value: 'Digita tu documento exactamente como fue registrado en recepción.',
  },
  {
    id_app: 'OA-PORTAL-009',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_biometrics_checkbox_label',
    value: 'Activar Face ID / Huella Dactilar en este dispositivo',
  },
  {
    id_app: 'OA-PORTAL-010',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_biometrics_checkbox_hint',
    value: 'Vinculará tu cédula para que en tus próximos ingresos entres en 1 segundo con tu sensor biométrico.',
  },
  {
    id_app: 'OA-PORTAL-011',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_btn_submit_login',
    value: 'Acceder a Mi Área Personal',
  },
  {
    id_app: 'OA-PORTAL-012',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_security_guarantee',
    value: 'Validación protegida por el hardware de tu dispositivo. Tu biometría no se almacena en servidores externos.',
  },
  {
    id_app: 'OA-PORTAL-013',
    component: 'ClientPortalModal',
    section: 'client_portal',
    key: 'portal_demo_banner_title',
    value: 'Usuarios de demostración para evaluación rápida:',
  },
];

/**
 * Utility helper to retrieve content by tech key with optional fallback.
 */
export function getContent(key: string, fallback = ''): string {
  const item = SITE_CONTENT.find((entry) => entry.key === key);
  return item ? item.value : fallback;
}
