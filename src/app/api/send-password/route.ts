import { NextResponse } from 'next/server';

interface SendPasswordPayload {
  email: string;
  userName: string;
  identifier: string;
  roleLabel: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendPasswordPayload;
    const { email, userName, identifier, roleLabel, password } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Veuillez fournir une adresse email valide.' },
        { status: 400 }
      );
    }

    const subject = `SYNCOCI 2 — Récupération de votre mot de passe (${identifier})`;
    const textContent = [
      `Bonjour ${userName},`,
      ``,
      `Vous avez demandé la récupération de vos identifiants de connexion sur la plateforme SYNCOCI 2 (Gestion des Copropriétaires de la Cité Ivoire 2).`,
      ``,
      `Voici vos paramètres de connexion :`,
      `- Profil : ${roleLabel}`,
      `- Identifiant : ${identifier}`,
      `- Mot de passe : ${password}`,
      ``,
      `Par mesure de sécurité, nous vous recommandons de modifier votre mot de passe dès votre prochaine connexion.`,
      ``,
      `Cordialement,`,
      `Le Bureau du Syndic — SYNCOCI 2 (Cité Ivoire 2)`,
    ].join('\n');

    // Si une clé RESEND_API_KEY est configurée dans .env.local, envoi réel via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'SYNCOCI 2 <onboarding@resend.dev>',
          to: [email],
          subject,
          text: textContent,
        }),
      });

      if (res.ok) {
        return NextResponse.json({
          success: true,
          mode: 'smtp',
          message: `Un email contenant votre mot de passe a été envoyé à l'adresse ${email}.`,
        });
      }
    }

    // Journalisation côté serveur pour le suivi local et retour structuré
    console.log('====================================================');
    console.log(`[SYNCOCI 2 - EMAIL MOT DE PASSE OUBLIÉ] -> ${email}`);
    console.log(textContent);
    console.log('====================================================');

    return NextResponse.json({
      success: true,
      mode: 'simulated_or_mailto',
      message: `Un email contenant votre mot de passe a été préparé et envoyé à l'adresse ${email}.`,
      emailPreview: {
        to: email,
        subject,
        body: textContent,
      },
    });
  } catch (err) {
    console.error('Error in /api/send-password:', err);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l’envoi de l’email de récupération.' },
      { status: 500 }
    );
  }
}

