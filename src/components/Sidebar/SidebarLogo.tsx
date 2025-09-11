import React from 'react'
import logoImage from '../../assets/logo.png'

interface SidebarLogoProps {
  collapsed: boolean
}

export const SidebarLogo: React.FC<SidebarLogoProps> = ({ collapsed }) => {
  return (
    <div style={{ 
      padding: '10px',
      margin: '10px',
      textAlign: 'center',
      borderBottom: '1px solid #3a3a5c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      {/* Logo Container */}
            <div style={{
        padding: '12px 16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}>
        <img 
          src={logoImage} 
          alt="Luminare Eventos" 
          style={{
            width: collapsed ? '64px' : '160px',
            height: collapsed ? '48px' : '90px',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            filter: 'brightness(1.1)',
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* Texto do nome (só quando expandido) */}
      {!collapsed && (
        <h2 style={{ 
          color: '#FFFFFF',
          margin: 0,
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FFFFFF, #e2e8f0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
        </h2>
      )}
    </div>
  )
}

export default SidebarLogo